import { ICryptography, IKeyPair } from '../crypto/interfaces';
import { IPublicRoom, IDirectRoom, IPrivateRoom } from '../room/interfaces';
import { deepClone } from '../util';
import { StorageProvider } from '../storage/interfaces';
import { IProfile, IRooms } from './interfaces';

/**
 * Manages the local profile of the current user. The profile is kept in-memory, and continuously synced with the profile stored in the selected
 * storage provider.
 */
class ProfileManager {

    /**
     * The key that is used to store the profile data in the storage provider.
     */
    private static PROFILE_STORAGE_KEY: string = "PROFILE";

    /**
     * Maximum length of any room's name.
     */
    public static ROOM_NAME_MAX_LENGTH: number = 200;

    private storageProvider: StorageProvider;
    private cryptography: ICryptography;

    private inMemoryProfile: IProfile | null = null;

    constructor(storageProvider: StorageProvider, cryptography: ICryptography) {
        this.storageProvider = storageProvider;
        this.cryptography = cryptography;
    }

    /**
     * Sync the current in-memory profile to the storage.
     */
    private async persistProfile(): Promise<void> {
        await this.storageProvider.save(ProfileManager.PROFILE_STORAGE_KEY, JSON.stringify(this.inMemoryProfile));
    }

    /**
     * Loads the profile from storage, returns false if it doesn't exist.
     */
    public async loadProfile(): Promise<boolean> {
        try {
            const loadedProfile = await this.storageProvider.load(ProfileManager.PROFILE_STORAGE_KEY);
            if (loadedProfile == null || loadedProfile == "")
                return false;

            this.inMemoryProfile = JSON.parse(loadedProfile);
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
     * Creates a new profile for the given params, and overwrites a profile in local storage, if exists.
     */
    public async initProfile(identityCommitment: string, root_hash: string, leaves: string[]): Promise<void> { 
        const userKeyPair: IKeyPair = await this.cryptography.generateKeyPair();
        const profile: IProfile = {
            rln_identity_commitment: identityCommitment,
            root_hash: root_hash,
            leaves: leaves,
            user_private_key: userKeyPair.privateKey,
            user_public_key: userKeyPair.publicKey,
            rooms: {
                public: [],
                private: [],
                direct: []
            }
        }
        this.inMemoryProfile = profile;
        await this.persistProfile();
    }

    /**
     * Validates if the provided object is a valid profile data.
     */
    public async validateFormat(parsed_profile_data: any): Promise<boolean> {

        const keys: string[] = Object.keys(parsed_profile_data);

        if (keys.length != 6)
            return false;

        const interfaceKeys: string[] = [
            "rln_identity_commitment", "root_hash", "leaves", "user_private_key", "user_public_key", "rooms"
        ];

        for (let iK of interfaceKeys) {
            if (keys.indexOf(iK) == -1) {
                return false;
            }
        }

        const rooms = parsed_profile_data['rooms'];
        const roomKeys: string[] = Object.keys(rooms);
        const roomInterfaceKeys = ['public', 'private', 'direct'];

        if (roomKeys.length != 3)
            return false;
        
        for (let iK of roomInterfaceKeys) {
            if (roomKeys.indexOf(iK) == -1) {
                return false;
            }
        }

        return true;
    }

    /**
     * Stores the profile in local storage, overwriting an existing one.
     */
    public async recoverProfile(profile: IProfile): Promise<void> {
        this.inMemoryProfile = deepClone(profile);
        await this.persistProfile();
    }

    /**
     * Check if profile exists.
     */
    public profileExists() {
        return this.inMemoryProfile != null;
    }

    /**
     * Exports profile to string.
     */
    public async exportProfile(): Promise<string> {
        if (this.profileExists()) {
            const clonedProfile: IProfile = deepClone(this.inMemoryProfile);
            clonedProfile.root_hash = "";
            clonedProfile.leaves = [];
            return JSON.stringify(this.inMemoryProfile);
        }
        throw "No profile exists locally";
    }

    /**
     * Returns the public key of the given profile.
     */
    public async getPublicKey(): Promise<string> {
        if (this.inMemoryProfile != null) {
            return this.inMemoryProfile.user_public_key;
        }
        throw "No profile exists locally";
    }

    /**
     * Returns the private key of the given profile.
     */
    public async getPrivateKey(): Promise<string> {
        if (this.inMemoryProfile != null) {
            return this.inMemoryProfile.user_private_key;
        }
        throw "No profile exists locally";
    }

    /**
     * Returns the profile, if exists.
     */
    public getProfile(): IProfile {
        if (this.inMemoryProfile != null)
            return this.inMemoryProfile;
        throw "No profile exists";
    }

    /**
     * Returns the rln root, if exists.
     */
    public getRlnRoot() {
        if (this.inMemoryProfile != null) {
            return this.inMemoryProfile.root_hash;
        }
        throw "Profile doesn't exist";
    }

    /**
     * Returns the identity commitment, if exists.
     */
    public getIdentityCommitment() {
        if (this.inMemoryProfile != null) {
            return this.inMemoryProfile.rln_identity_commitment;
        }
        throw "Profile doesn't exist";
    }

    /**
     * Returns the leaves, if exists.
     */
    public getLeaves(): string[] {
        if (this.inMemoryProfile != null) {
            return this.inMemoryProfile.leaves;
        }
        throw "Profile doesn't exist";
    }

    /**
     * Updates the root hash, if profile exists.
     */
    public async updateRootHash(hash: string) {
        if (this.inMemoryProfile != null) {
            this.inMemoryProfile.root_hash = hash;
            await this.persistProfile();
        }
    } 

    /**
     * Updates the leaves, if profile exists.
     */
    public async updateLeaves(leaves: string[]) {
        if (this.inMemoryProfile != null) {
            this.inMemoryProfile.leaves = leaves;
            await this.persistProfile();
        }
    }

    /**
     * Creates a public room.
     * Throws an exception if a room with the same key exists (which means the user already is part of that room)
     */
    public async addPublicRoom(room: IPublicRoom) {
        if (this.inMemoryProfile != null) {

            const indexOfExistingRoomIfAny = this.inMemoryProfile.rooms.public.findIndex(r => r.symmetric_key == room.symmetric_key);

            if (indexOfExistingRoomIfAny != -1)
                throw "Room already exists";

            this.inMemoryProfile.rooms.public.push(room);
            await this.persistProfile();
        }
    }

    /**
     * Creates a private room.
     * Throws an exception if a room with the same key exists (which means the user already is part of that room)
     */
    public async addPrivateRoom(room: IPrivateRoom) {
        if (this.inMemoryProfile != null) {

            const indexOfExistingRoomIfAny = this.inMemoryProfile.rooms.private.findIndex(r => r.symmetric_key == room.symmetric_key);

            if (indexOfExistingRoomIfAny != -1)
                throw "Room already exists";

            this.inMemoryProfile.rooms.private.push(room);
            await this.persistProfile();
        }
    }

    /**
     * Creates a direct room.
     * Throws an exception if a room with the same recepient public key exists (which means the user already is part of that room)
     */
    public async addDirectRoom(room: IDirectRoom) {
        if (this.inMemoryProfile != null) {

            const indexOfExistingRoomIfAny = this.inMemoryProfile.rooms.direct.findIndex(r => r.recipient_public_key == room.recipient_public_key);

            if (indexOfExistingRoomIfAny != -1)
                throw "Room already exists";

            this.inMemoryProfile.rooms.direct.push(room);
            await this.persistProfile();
        }
    }

    /**
     * Return all rooms for the user.
     */
    public async getRooms(): Promise<IRooms> {
        if (this.inMemoryProfile != null) {            
            return deepClone(this.inMemoryProfile.rooms);
        }
        return {
            public: [],
            private: [],
            direct: []
        };
    }

    /**
     * Return all room ids for the user.
     */
    public async getRoomIds(): Promise<string[]> {
        if (this.inMemoryProfile != null) {
                return Array()
                    .concat(this.inMemoryProfile.rooms.public.map(r => r.id))
                    .concat(this.inMemoryProfile.rooms.private.map(r => r.id))
                    .concat(this.inMemoryProfile.rooms.direct.map(r => r.id));
        }
        return [];
    }

    /**
     * Return a room by id, throws an exception if no room with the given id exists.
     */
    public async getRoomById(id: string): Promise<any> {
        if (this.inMemoryProfile == null)
            throw "Profile doesn't exist";

        const publicIndex = this.inMemoryProfile.rooms.public.findIndex(r => r.id == id);
        if (publicIndex != -1) {
            return deepClone(this.inMemoryProfile.rooms.public[publicIndex]);
        }

        const privateIndex = this.inMemoryProfile.rooms.private.findIndex(r => r.id == id);
        if (privateIndex != -1) {
            return deepClone(this.inMemoryProfile.rooms.private[privateIndex]);
        }

        const directIndex = this.inMemoryProfile.rooms.direct.findIndex(r => r.id == id);
        if (directIndex != -1) {
            return deepClone(this.inMemoryProfile.rooms.direct[directIndex]);
        }

        throw "Room doesn't exist";
    }

    /**
     * Encrypts a message using the target room's key.
     */
    public async encryptMessageForRoom(id: string, message: string): Promise<string> {
        if (this.inMemoryProfile == null)
            throw "Profile doesn't exist";

        const publicIndex = this.inMemoryProfile.rooms.public.findIndex(r => r.id == id);
        if (publicIndex != -1) {
            const room: IPublicRoom = this.inMemoryProfile.rooms.public[publicIndex];
            return this.cryptography.encryptMessageSymmetric(message, room.symmetric_key);
        }

        const privateIndex = this.inMemoryProfile.rooms.private.findIndex(r => r.id == id);
        if (privateIndex != -1) {
            const room: IPrivateRoom = this.inMemoryProfile.rooms.private[privateIndex];
            return this.cryptography.encryptMessageSymmetric(message, room.symmetric_key);
        }

        const directIndex = this.inMemoryProfile.rooms.direct.findIndex(r => r.id == id);
        if (directIndex != -1) {
            const room: IDirectRoom = this.inMemoryProfile.rooms.direct[directIndex];
            return this.cryptography.encryptMessageSymmetric(message, room.symmetric_key);
        }

        throw "Room doesn't exist";
    }

    /**
     * Return specific rooms for the user.
     */
    public async getUserRoomsForChatType(type: string): Promise<any[]> {
        if (this.inMemoryProfile == null)
            throw "Profile doesn't exist";

        if (type == "PUBLIC") {
            return deepClone(this.inMemoryProfile.rooms.public);
        } else if (type == "PRIVATE") {
            return deepClone(this.inMemoryProfile.rooms.private);
        } else if (type == "DIRECT") {
            return deepClone(this.inMemoryProfile.rooms.direct);
        } else {
            return [];
        }
    }

    /**
     * Encrypts the direct room's symmetric key with the recepient public key.
     */
    public async generateEncryptedInviteDirectRoom(room_id: string): Promise<string> {
        if (this.inMemoryProfile == null)
            throw "Profile doesn't exist";

        const directIndex = this.inMemoryProfile.rooms.direct.findIndex(r => r.id == room_id);
        if (directIndex == -1)
            throw "Room doesn't exist";
        const room: IDirectRoom = this.inMemoryProfile.rooms.direct[directIndex];

        return this.cryptography.encryptMessageAsymmetric(room.symmetric_key, room.recipient_public_key);
    }

    /**
     * Updates the direct room's symmetric key, by decrypting an invite with the user's private key.
     */
    public async updateDirectRoomKey(room_id: string, encrypted_symmetric_key: string): Promise<void> {
        if (this.inMemoryProfile == null)
            throw "Profile doesn't exist";

        const directIndex = this.inMemoryProfile.rooms.direct.findIndex(r => r.id == room_id);
        if (directIndex == -1)
            throw "Room doesn't exist";

        const room: IDirectRoom = this.inMemoryProfile.rooms.direct[directIndex];

        const decrypted_symm_key = await this.cryptography.decryptMessageAsymmetric(encrypted_symmetric_key, this.inMemoryProfile.user_private_key);

        room.symmetric_key = decrypted_symm_key;
        await this.persistProfile();
    }

}

export default ProfileManager