import { IKeyExchangeEnabledRoom } from './../room/interfaces';
import { ICryptography, IKeyPair } from '../crypto/interfaces';
import { IPublicRoom, IDirectRoom, IPrivateRoom } from '../room/interfaces';
import { deepClone } from '../util';
import { StorageProvider } from '../storage/interfaces';
import { IProfile, IRooms, ITrustedContact, ITrustedContactsMap } from './interfaces';

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

    private generateRandomID() {
        return Math.floor(Math.random() * 1000000);
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

            if (this.inMemoryProfile != null && this.inMemoryProfile.contacts==null) {
                this.inMemoryProfile.contacts = {};
            }

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
            },
            contacts: {},
            username: "",
            user_id: this.generateRandomID()
        }
        this.inMemoryProfile = profile;
        await this.persistProfile();
    }

    /**
     * Validates if the provided object is a valid profile data.
     */
    public async validateFormat(parsed_profile_data: any): Promise<boolean> {

        const keys: string[] = Object.keys(parsed_profile_data);

        if (keys.length != 9)
            return false;

        const interfaceKeys: string[] = [
            "rln_identity_commitment", 
            "root_hash", 
            "leaves", 
            "user_private_key", 
            "user_public_key", 
            "rooms", 
            "contacts", 
            "username", 
            "user_id"
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
    * Updates the username.
    */
    public async updateUsername(newName: string) {
        if (this.inMemoryProfile != null) {
            this.inMemoryProfile.username = newName;
            if (this.inMemoryProfile.user_id == null) {
                this.inMemoryProfile.user_id = this.generateRandomID();
            }
            await this.persistProfile();
        }
    }

    /**
     * Returns the user handle.
     */
    public getUserHandle() {
        if (this.inMemoryProfile && this.inMemoryProfile.username != null && this.inMemoryProfile.user_id != null) {
            return `${this.inMemoryProfile?.username}#${this.inMemoryProfile?.user_id}`;
        }
        return "anon";
    }

    /**
     * Returns the username.
     */
    public getUserName() {
        if (this.inMemoryProfile) {
            return this.inMemoryProfile.username
        }
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
     * Returns all trusted contacts registered in the user's profile
     */
    public getTrustedContacts(): ITrustedContactsMap {
        if (this.inMemoryProfile != null) {
            return this.inMemoryProfile.contacts;
        }
        throw "Profile doesn't exist";
    }

    /**
     * Returns the trusted contact with the given name, if exists
     */
    public getTrustedContact(name: string): ITrustedContact {
        if (this.inMemoryProfile != null) {
            if (Object.keys(this.inMemoryProfile.contacts).indexOf(name) != -1) {
                return this.inMemoryProfile.contacts[name];
            }
            throw "Contact doesn't exist";
        }
        throw "Profile doesn't exist";
    }

    /**
     * Saves the trusted contact with the given name and public key. 
     * Throws an exception if a contact with the same name already exists.
     */
    public async insertTrustedContact(name: string, publicKey: string) {
        if (this.inMemoryProfile != null) {
            this.validateContactWithSameNameDoesntExist(this.inMemoryProfile, name);
            this.validateContactWithSamePublicKeyDoesntExist(this.inMemoryProfile, publicKey);

            this.inMemoryProfile.contacts[name] = {
                name: name,
                publicKey: publicKey
            };
            return await this.persistProfile();
        }
        throw "Profile doesn't exist";
    }

    /**
     * Updates the trusted contact with the given name and public key. 
     * Throws an exception if a contact with the new name already exists.
     */
    public async updateTrustedContact(old_name: string, new_name: string, publicKey: string) {
        if (this.inMemoryProfile != null) {
            this.validateContactExists(this.inMemoryProfile, old_name);
            this.validateContactWithSameNameDoesntExist(this.inMemoryProfile, new_name);
            this.validateContactWithSamePublicKeyDoesntExist(this.inMemoryProfile, publicKey, [old_name]);

            delete this.inMemoryProfile.contacts[old_name];
            this.inMemoryProfile.contacts[new_name] = {
                name: new_name,
                publicKey: publicKey
            };
            return await this.persistProfile();
        }
        throw "Profile doesn't exist";
    }

    /**
     * Deletes a trusted contact with the specified name, if it exists.
     */
    public async deleteTrustedContact(name: string) {
        if (this.inMemoryProfile != null) {
            this.validateContactExists(this.inMemoryProfile, name);

            delete this.inMemoryProfile.contacts[name];

            return await this.persistProfile();
        }
        throw "Profile doesn't exist";
    }

    private validateContactExists(profile: IProfile, name: string) {
        if (Object.keys(profile.contacts).indexOf(name) == -1) {
            throw "The specified contact doesn't exist";
        }
    }

    private validateContactWithSameNameDoesntExist(profile: IProfile, name: string) {
        if (Object.keys(profile.contacts).indexOf(name) != -1) {
            throw "A contact with the same name already exists";
        }
    }

    /**
     * If a contact with the given public key exists, that is returned, otherwise null is returned.
     */
    private validateContactWithSamePublicKeyDoesntExist(profile: IProfile, publicKey: string, ignoredKeys: string[] = []) {
        for (let c of Object.keys(profile.contacts)) {
            if (ignoredKeys.indexOf(c) != -1)
                continue;

            if (profile.contacts[c].publicKey == publicKey) {
                throw "A contact with the same public key already exists";
            }
        }
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
    * Derives the direct room's symmetric key, using the receiver's public key
    */
    public async deriveRoomSecretKey(keyExchangeEnabledRoom: IKeyExchangeEnabledRoom, dh_public_key: string): Promise<void> {
        if (this.inMemoryProfile == null)
            throw "Profile doesn't exist";

        const derived_secret_key: string = await this.cryptography.deriveSharedSecretKey(keyExchangeEnabledRoom.dh_private_key, dh_public_key);

        keyExchangeEnabledRoom.symmetric_key = derived_secret_key;
        await this.persistProfile();
    }

    /**
     * Returns only the direct rooms, which support DH key exchange.
     */
    public getAllRoomsAvailableForKeyExchange(): IKeyExchangeEnabledRoom[] {
        if (this.inMemoryProfile == null)
            throw "Profile doesn't exist";

        if (this.inMemoryProfile.rooms.direct.length == 0)
            return [];
        return this.inMemoryProfile.rooms.direct.filter(room => room.symmetric_key == "");
    }

}

export default ProfileManager