import { ITrustedContactsMap } from '../../src/profile/interfaces';
import { IDirectRoom } from '../../src/room/interfaces';
import { IProfile } from '../../src/profile/interfaces';
import { StorageProvider } from '../../src/storage/interfaces';
import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'
import { ICryptography, IKeyPair } from '../../src/crypto/interfaces';
import ProfileManager from '../../src/profile/index';
import { deepClone } from '../../src/util';

class TestStorageProvider implements StorageProvider {

    private data = {}

    constructor() { }

    public async save(key: string, data: string) {
        this.data[key] = data;
    };

    public async load(key: string): Promise<string> {
        const retrievedItem = this.data[key];

        return new Promise((res, rej) => {
            if (retrievedItem)
                res(retrievedItem)
            else
                rej("Requested item was not found");
        })
    };

}

class LocalTestCryptography implements ICryptography {

    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    generateSymmetricKey = async (): Promise<string> => {
        return (this.seed * 10000).toString();
    };

    generateECDHKeyPair = async (): Promise<IKeyPair> => {
        return this.generateKeyPair()
    }

    deriveSharedSecretKey = async (sourcePrivateKey: string, targetPublicKey: string): Promise<string> => {
        return "derived-" + sourcePrivateKey + targetPublicKey;
    }

    generateKeyPair = async (): Promise<IKeyPair> => {
        const privateKey = this.seed * 10000;
        const publicKey = (this.seed * 12345) ^ privateKey;

        return {
            publicKey: publicKey.toString(),
            privateKey: privateKey.toString()
        }
    };

    encryptMessageSymmetric = async (message: string, symmetricKey: string): Promise<string> => {
        return message + "___" + symmetricKey;
    }

    decryptMessageSymmetric = async (cyphertext: string, symmetricKey: string): Promise<string> => {
        return cyphertext.substr(0, cyphertext.indexOf('___'));
    }

    encryptMessageAsymmetric = async (message: string, publicKey: string): Promise<string> => {
        return message + "___" + publicKey;
    };

    decryptMessageAsymmetric = async (cyphertext: string, privateKey: string): Promise<string> => {
        return cyphertext.substr(0, cyphertext.indexOf('___'));
    }
    
    hash = (data: string): string => {
        return "hash-" + data;
    }
}

describe('Test profile', () => {

    const testProfile: IProfile = {
        rln_identity_commitment: "test_id_commitment_1",
        leaves: ["123", "1234"],
        root_hash: "test",
        user_private_key: "priv",
        user_public_key: "pub",
        rooms: {
            public: [],
            private: [],
            direct: []
        },
        contacts: {},
        username: "test",
        user_id: 3749
    }

    let crypto: ICryptography;
    let storage: StorageProvider;

    let profileManager: ProfileManager;

    beforeAll(async () => {
        crypto = new LocalTestCryptography(123);
        storage = new TestStorageProvider();
        profileManager = new ProfileManager(storage, crypto);
    });

    beforeEach(async () => {
        storage.save("PROFILE", "");
        profileManager = new ProfileManager(storage, crypto);
    });

    test('load profile - exists', async () => {
        jest.spyOn(storage, "load").mockResolvedValue(JSON.stringify(testProfile));

        const loadedProfile = await profileManager.loadProfile();
        expect(loadedProfile).toBeTruthy();
    });

    test('load profile - not exists', async () => {
        jest.spyOn(storage, "load").mockRejectedValue(null);
        const loadedProfile = await profileManager.loadProfile();
        expect(loadedProfile).toBeFalsy();
    });

    test('init profile', async () => {
        await profileManager.initProfile("id1", "root1", ["sha-1", "sha-2"]);
        expect(await profileManager.profileExists()).toBeTruthy();
    });

    test('validate format', async () => {
        const formatInvalid1 = await profileManager.validateFormat(JSON.stringify({"key": "val1"}));
        expect(formatInvalid1).toBeFalsy();

        const formatInvalid2 = await profileManager.validateFormat(
            { 
                "key1": "val1" ,
                "key2": "val1",
                "key3": "val1",
                "key4": "val1",
                "key5": "val1",
                "key6": "val1",
                "key7": "val1",
            });
        expect(formatInvalid2).toBeFalsy();

        const formatInvalid3 = await profileManager.validateFormat(
            {
                "rln_identity_commitment": "val1",
                "leaves": ["val1", "val2"],
                "root_hash": "val1",
                "user_private_key": "val1",
                "user_public_key": "val1",
                "rooms": {},
                "username": "test",
                "user_id": 348979
            });
        expect(formatInvalid3).toBeFalsy();

        const formatValid = await profileManager.validateFormat(
            {
                "rln_identity_commitment": "val1",
                "leaves": ["val1", "val2"],
                "root_hash": "val1",
                "user_private_key": "val1",
                "user_public_key": "val1",
                "rooms": {
                    "public": [],
                    "private": [],
                    "direct": []
                },
                "contacts": {},
                "username": "test",
                "user_id": 348979
            });
        expect(formatValid).toBeTruthy();

    });

    test('update username', async () => {
        await profileManager.recoverProfile(testProfile);

        expect(await profileManager.profileExists()).toBeTruthy();

        profileManager.updateUsername('test-updated')

        expect(profileManager.getUserName()).toEqual('test-updated')
    })

    test('get user handle', async () => {
        await profileManager.recoverProfile(testProfile);

        expect(await profileManager.profileExists()).toBeTruthy();

        expect(profileManager.getUserHandle()).toEqual('test#3749')
    })

    test('recover profile', async () => {
        await profileManager.recoverProfile(testProfile);

        expect(await profileManager.profileExists()).toBeTruthy();

        const profile = profileManager.getProfile();
        expect(profile.root_hash).toEqual(testProfile.root_hash);
    });

    test('export profile', async () => {
        await profileManager.recoverProfile(testProfile);
        const profile: string = await profileManager.exportProfile();
        expect(JSON.stringify(testProfile)).toStrictEqual(profile)
    });

    test('get public key', async () => {
        await profileManager.recoverProfile(testProfile);
        const key: string = await profileManager.getPublicKey();
        expect(testProfile.user_public_key).toStrictEqual(key)
    });

    test('get public key - not exists', async () => {
        try {
            const key: string = await profileManager.getPublicKey();
            expect(testProfile.user_public_key).toStrictEqual(key);
            expect(false).toBeTruthy();
        } catch(e) {
            expect(true).toBeTruthy();
        }
    });

    test('get private key', async () => {
        await profileManager.recoverProfile(testProfile);
        const key: string = await profileManager.getPrivateKey();
        expect(testProfile.user_private_key).toStrictEqual(key)
    });

    test('get private key - not exists', async () => {
        try {
            const key: string = await profileManager.getPrivateKey();
            expect(testProfile.user_private_key).toStrictEqual(key);
            expect(false).toBeTruthy();
        } catch (e) {
            expect(true).toBeTruthy();
        }
    });

    test('get rln root', async () => {
        await profileManager.recoverProfile(testProfile);
        const root: string = await profileManager.getRlnRoot();
        expect(testProfile.root_hash).toStrictEqual(root);
    });

    test('get identity commitment', async () => {
        await profileManager.recoverProfile(testProfile);
        const id: string = await profileManager.getIdentityCommitment();
        expect(testProfile.rln_identity_commitment).toStrictEqual(id);
    });

    test('get leaves', async () => {
        await profileManager.recoverProfile(testProfile);
        const leaves: string[] = await profileManager.getLeaves();
        expect(testProfile.leaves).toEqual(leaves);
    });

    test('update leaves', async () => {
        await profileManager.recoverProfile(testProfile);

        const new_leaves: string[] = ["0000", "1212", "1100"];
        await profileManager.updateLeaves(new_leaves)
        const leaves: string[] = await profileManager.getLeaves();
        expect(new_leaves).toEqual(leaves);
    });

    test('update root hash', async () => {
        await profileManager.recoverProfile(testProfile);

        await profileManager.updateRootHash("updated");

        const root_hash = await profileManager.getRlnRoot();
        expect(root_hash).toEqual("updated");
    });

    test('add public room', async () => {
        await profileManager.recoverProfile(testProfile);

        const room = {
            name: "test",
            id: "test-1",
            type: "PUBLIC",
            symmetric_key: "test key"
        };

        await profileManager.addPublicRoom(room);

        const profile = profileManager.getProfile();
        expect(profile.rooms.public.length).toEqual(1);
        expect(profile.rooms.public[0].id).toEqual("test-1");
    });

    test('add public room - already exists', async () => {
        await profileManager.recoverProfile(testProfile);

        const room = {
            name: "test",
            id: "test-1",
            type: "PUBLIC",
            symmetric_key: "test key"
        };

        await profileManager.addPublicRoom(room);

        const profile = profileManager.getProfile();
        expect(profile.rooms.public.length).toEqual(1);
        expect(profile.rooms.public[0].id).toEqual("test-1");

        const room2 = deepClone(room);

        try {
            await profileManager.addPublicRoom(room2);
            expect(true).toBeFalsy();
        } catch(e) {
            expect(e).toEqual("Room already exists");
            expect(true).toBeTruthy();
        }
    });

    test('add private room', async () => {
        await profileManager.recoverProfile(testProfile);

        const room = {
            name: "test",
            id: "test-1",
            type: "PRIVATE",
            symmetric_key: "test key"
        };

        await profileManager.addPrivateRoom(room);

        const profile = profileManager.getProfile();
        expect(profile.rooms.private.length).toEqual(1);
        expect(profile.rooms.private[0].id).toEqual("test-1");
    });

    test('add private room - already exists', async () => {
        await profileManager.recoverProfile(testProfile);

        const room = {
            name: "test",
            id: "test-1",
            type: "PRIVATE",
            symmetric_key: "test key"
        };

        await profileManager.addPrivateRoom(room);

        const profile = profileManager.getProfile();
        expect(profile.rooms.private.length).toEqual(1);
        expect(profile.rooms.private[0].id).toEqual("test-1");

        const room2 = deepClone(room);

        try {
            await profileManager.addPrivateRoom(room2);
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e).toEqual("Room already exists");
            expect(true).toBeTruthy();
        }
    });

    test('add direct room', async () => {
        await profileManager.recoverProfile(testProfile);

        const room: IDirectRoom = {
            name: "test",
            id: "test-1",
            type: "PRIVATE",
            symmetric_key: "test key",
            recipient_public_key: "test key",
            dh_public_key: "test-pub",
            dh_private_key: "test-pub"
        };

        await profileManager.addDirectRoom(room);

        const profile = profileManager.getProfile();
        expect(profile.rooms.direct.length).toEqual(1);
        expect(profile.rooms.direct[0].id).toEqual("test-1");
    });

    test('add direct room - already exists', async () => {
        await profileManager.recoverProfile(testProfile);

        const room: IDirectRoom = {
            name: "test",
            id: "test-1",
            type: "PRIVATE",
            symmetric_key: "test key",
            recipient_public_key: "test key",
            dh_public_key: "test-pub",
            dh_private_key: "test-pub"
        };

        await profileManager.addDirectRoom(room);

        const profile = profileManager.getProfile();
        expect(profile.rooms.direct.length).toEqual(1);
        expect(profile.rooms.direct[0].id).toEqual("test-1");

        const room2 = deepClone(room);

        try {
            await profileManager.addDirectRoom(room2);
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e).toEqual("Room already exists");
            expect(true).toBeTruthy();
        }
    });

    test('get rooms', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));

        const room: IDirectRoom= {
            name: "test",
            id: "test-1",
            type: "PRIVATE",
            symmetric_key: "test key",
            recipient_public_key: "test key",
            dh_public_key: "test-pub",
            dh_private_key: "test-pub"
        };

        await profileManager.addDirectRoom(room);

        const rooms = await profileManager.getRooms();
        expect(rooms.public.length).toEqual(0);
        expect(rooms.private.length).toEqual(0);
        expect(rooms.direct.length).toEqual(1);
    });

    test('get rooms - empty', async () => {
        const rooms = await profileManager.getRooms();
        expect(rooms.public.length).toEqual(0);
        expect(rooms.private.length).toEqual(0);
        expect(rooms.direct.length).toEqual(0);
    });

    test('get room ids', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));

        const room: IDirectRoom = {
            name: "test",
            id: "test-1",
            type: "PRIVATE",
            symmetric_key: "test key",
            recipient_public_key: "test key",
            dh_public_key: "test-pub",
            dh_private_key: "test-pub"
        };

        await profileManager.addDirectRoom(room);

        const roomIds: string[] = await profileManager.getRoomIds();
        expect(roomIds).toStrictEqual(["test-1"]);
    });

    test('get room by id - direct', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));

        const room: IDirectRoom = {
            name: "test",
            id: "test-1",
            type: "PRIVATE",
            symmetric_key: "test key",
            recipient_public_key: "test key",
            dh_public_key: "test-pub",
            dh_private_key: "test-pub"
        };

        await profileManager.addDirectRoom(room);

        const retrievedRoom = await profileManager.getRoomById("test-1");
        expect(retrievedRoom).toStrictEqual(room);


        // doesn't exist
        try {
            await profileManager.getRoomById("test-1");
            expect(false).toBeTruthy();
        } catch(e) {
            expect(true).toBeTruthy();
        }
    });

    test('get room by id - public', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));

        const room = {
            name: "test",
            id: "test-1",
            type: "PRIVATE",
            symmetric_key: "test key"
        };

        await profileManager.addPublicRoom(room);

        const retrievedRoom = await profileManager.getRoomById("test-1");
        expect(retrievedRoom).toStrictEqual(room);

    });

    test('get room by id - private', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));

        const room = {
            name: "test",
            id: "test-1",
            type: "PRIVATE",
            symmetric_key: "test key"
        };

        await profileManager.addPrivateRoom(room);

        const retrievedRoom = await profileManager.getRoomById("test-1");
        expect(retrievedRoom).toStrictEqual(room);

    });

    test('encrypt message for room', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));

        const room1 = {
            name: "test",
            id: "test-1",
            type: "PUBLIC",
            symmetric_key: "test key 1"
        };

        const room2 = {
            name: "test",
            id: "test-2",
            type: "PRIVATE",
            symmetric_key: "test key 2"
        };

        const room3: IDirectRoom = {
            name: "test",
            id: "test-3",
            type: "DIRECT",
            symmetric_key: "test key 3",
            recipient_public_key: "test key 3",
            dh_public_key: "test-pub",
            dh_private_key: "test-pub"
        };

        await profileManager.addPublicRoom(room1);
        await profileManager.addPrivateRoom(room2);
        await profileManager.addDirectRoom(room3);

        const encrypted_room_1 = await profileManager.encryptMessageForRoom("test-1", "test message");
        const encrypted_room_2 = await profileManager.encryptMessageForRoom("test-2", "test message");
        const encrypted_room_3 = await profileManager.encryptMessageForRoom("test-3", "test message");

        expect(encrypted_room_1).toEqual("test message___test key 1");
        expect(encrypted_room_2).toEqual("test message___test key 2");
        expect(encrypted_room_3).toEqual("test message___test key 3");
    });

    test('get user rooms for chat type', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));

        const room1 = {
            name: "test",
            id: "test-1",
            type: "PUBLIC",
            symmetric_key: "test key 1"
        };

        const room2 = {
            name: "test",
            id: "test-2",
            type: "PRIVATE",
            symmetric_key: "test key 2"
        };

        const room3: IDirectRoom = {
            name: "test",
            id: "test-3",
            type: "DIRECT",
            symmetric_key: "test key 3",
            recipient_public_key: "test key 3",
            dh_public_key: "test-pub",
            dh_private_key: "test-pub"
        };

        await profileManager.addPublicRoom(room1);
        await profileManager.addPrivateRoom(room2);
        await profileManager.addDirectRoom(room3);

        expect(await (await profileManager.getUserRoomsForChatType("PUBLIC")).length).toEqual(1);
        expect(await (await profileManager.getUserRoomsForChatType("PRIVATE")).length).toEqual(1);
        expect(await (await profileManager.getUserRoomsForChatType("DIRECT")).length).toEqual(1);
        expect(await (await profileManager.getUserRoomsForChatType("XX")).length).toEqual(0);
    });

    test('derive key for direct room', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));

        const room1: IDirectRoom = {
            name: "test",
            id: "test-3",
            type: "DIRECT",
            symmetric_key: "",
            recipient_public_key: "test key 3",
            dh_public_key: "test-pub",
            dh_private_key: "test-priv"
        };

        await profileManager.addDirectRoom(room1);

        await profileManager.deriveRoomSecretKey(room1, "test-public-from-recepient");

        const room: IDirectRoom = await profileManager.getRoomById("test-3");
        expect(room.symmetric_key).toEqual("derived-test-privtest-public-from-recepient");
    });
    
    test('get contacts - empty', async() => {
        await profileManager.recoverProfile(deepClone(testProfile));
        const contacts: ITrustedContactsMap = profileManager.getTrustedContacts();
        expect(Object.keys(contacts).length).toEqual(0);
    })

    test('get contacts - not empty', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));
        await profileManager.insertTrustedContact("test", "test key");
        
        const contacts: ITrustedContactsMap = await profileManager.getTrustedContacts();
        expect(Object.keys(contacts).length).toEqual(1);
    })

    test('insert contact - doesnt exist', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));
        await profileManager.insertTrustedContact("test", "test key");

        const contact = profileManager.getTrustedContact("test");
        expect(contact.name).toEqual("test");
        expect(contact.publicKey).toEqual("test key");
    })

    test('insert contact - exists', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));
        await profileManager.insertTrustedContact("test", "test key");

        try {
            await profileManager.insertTrustedContact("test", "test key");
            expect(true).toBeFalsy();
        } catch(e) {
            expect(true).toBeTruthy();
        }
    })

    test('insert contact - contact with public key already exists', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));
        await profileManager.insertTrustedContact("test", "test public key");

        try {
            await profileManager.insertTrustedContact("different contact", "test public key");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }
    })

    test('get contact - doesnt exist', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));
        try {
            profileManager.getTrustedContact("non existent contact");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }
    })

    test('get contact - exists', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));
        await profileManager.insertTrustedContact("test", "test key");
        const contact = profileManager.getTrustedContact("test");
        expect(contact).not.toBeNull();
    })

    test('delete contact - exists', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));
        await profileManager.insertTrustedContact("test", "test key");
        const contact = profileManager.getTrustedContact("test");
        expect(contact).not.toBeNull();

        await profileManager.deleteTrustedContact("test");
        try {
            profileManager.getTrustedContact("test");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }
    })

    test('delete contact - doesnt exist', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));
        
        try {
            await profileManager.deleteTrustedContact("test");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }
    })

    test('update contact - doesnt exist', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));

        try {
            await profileManager.updateTrustedContact("old", "new", "test");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }
    })

    test('update contact - exists', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));
        await profileManager.insertTrustedContact("test", "test key");

        await profileManager.updateTrustedContact("test", "new", "test");

        const contact = profileManager.getTrustedContact("new");
        expect(contact).not.toBeNull();
        expect(contact.name).toEqual('new');
        expect(contact.publicKey).toEqual('test');

        const allContacts = profileManager.getTrustedContacts();
        expect(Object.keys(allContacts).length).toEqual(1);
    })

    test('update contact - new name already exists', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));
        await profileManager.insertTrustedContact("test", "test key");

        await profileManager.insertTrustedContact("new", "new key");

        try {
            await profileManager.updateTrustedContact("test", "new", "test");
            expect(false).toBeTruthy();
        } catch(e) {
            expect(true).toBeTruthy();
        }
    })

    test('update contact - new public key already exists', async () => {
        await profileManager.recoverProfile(deepClone(testProfile));
        await profileManager.insertTrustedContact("test 1", "test key 1");

        await profileManager.insertTrustedContact("test 2", "test key 2");

        try {
            await profileManager.updateTrustedContact("test 1", "updated test 1", "test key 2");
            expect(false).toBeTruthy();
        } catch (e) {
            expect(true).toBeTruthy();
        }
    })

});