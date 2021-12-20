import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'
import { ServerCommunication } from '../src/communication/index';
import { StorageProvider } from '../src/storage/interfaces';
const ws = require("ws");
import { randomText } from './crypto/web_cryptography.test';

import {
    init,
    get_rooms,
    send_message,
    receive_message,
    create_public_room,
    join_public_room,
    create_private_room,
    invite_private_room,
    join_private_room,
    generate_encrypted_invite_direct_room,
    update_direct_room_key,
    create_direct_room,
    get_chat_history,
    get_public_key,
    export_profile,
    recover_profile
} from '../src/index';

import ProfileManager from '../src/profile';
import { ICryptography, IKeyPair } from '../src/crypto/interfaces';
import ChatManager from '../src/chat';
import WebCryptography from '../src/crypto/web_cryptography';


/**
 * When running tests with jest, there's an issue with circomlibjs dependencies, related to ethereum utils.
 * Mocking that here with a deterministic mock for posseidon hasher.
 */
jest.mock("../src/hasher", () => {
    return jest.fn().mockImplementation(() => {
        return {
            genSignalHash: (data: string) => {
                return data;
            },
            genExternalNullifier: (data: string): string => {
                return data;
            },
            genWitness: (identitySecret, witness, externalNullifier, signal, rln_id) => {
                return "witness_" + identitySecret[0].toString();
            },
            genProof: async (proofWitness, circuit_path, key_path) => {
                return {
                    proof: "test_proof_" + proofWitness
                }
            },
            calculateOutput: (identitySecret, externalNullifier, xShare, share_count, rln_id) => {
                return [BigInt(11111), BigInt(22222)]
            }
        }
    });
})

const send_message_socket = jest.fn();
const open_event = jest.fn();

const receive_message_socket = jest.fn();

jest.mock("ws", () => {
    return jest.fn().mockImplementation(() => {
        return {
            send: data => {
                send_message_socket(data);
            },
            on: (event, callback) => {
                if (event == 'open') {
                    open_event(event);
                    callback();
                } else if (event == 'message') {
                    receive_message_socket("test message");
                    callback("test message");
                }
            }
        }
    });
});

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
        return (this.seed * 1111).toString();
    };

    generateKeyPair = async (): Promise<IKeyPair> => {
        const privateKey = this.seed * 1111;
        const publicKey = (this.seed * 12345) ^ privateKey;

        return {
            publicKey: publicKey.toString(),
            privateKey: privateKey.toString()
        }
    };

    encryptMessageSymmetric = async (message: string, symmetricKey: string): Promise<string> => {
        return message + "||" + symmetricKey;
    }

    decryptMessageSymmetric = async (cyphertext: string, symmetricKey: string): Promise<string> => {
        return cyphertext.substr(0, cyphertext.indexOf('||'));
    }

    encryptMessageAsymmetric = async (message: string, publicKey: string): Promise<string> => {
        return message + "||" + publicKey;
    };

    decryptMessageAsymmetric = async (cyphertext: string, privateKey: string): Promise<string> => {
        return cyphertext.substr(0, cyphertext.indexOf('||'));
    }
}


describe('Test main', () => {

    beforeEach(async () => {
        jest.restoreAllMocks();
    });

    afterAll(async() => {
        jest.restoreAllMocks();
    })

    test('init - default params, no profile exists', async () => {
        jest.spyOn(ServerCommunication.prototype, "init").mockImplementation(() => {
            return new Promise((res, rej) => {res()});
        });
        jest.spyOn(ProfileManager.prototype, "loadProfile").mockResolvedValue(false);

        try {
            await init({
                serverUrl: "test1",
                socketUrl: "ws://test2"
            });
            expect(true).toBeFalsy();
        } catch(e) {
            expect(true).toBeTruthy();
        }
    });


    test('init - default params, profile exists', async () => {
        jest.spyOn(ServerCommunication.prototype, "init").mockImplementation(() => {
            return new Promise((res, rej) => { res() });
        });

        jest.spyOn(ProfileManager.prototype, "loadProfile").mockResolvedValue(true);

        await init({
            serverUrl: "test1",
            socketUrl: "ws://test2"
        });
        expect(true).toBeTruthy();
    });

    test('init - new profile', async () => {
        const initProfileSpy = await init_new_profile();
        expect(initProfileSpy).toHaveBeenCalled();
    });

    test('init - new profile and custom cryptography and storage', async () => {
        jest.spyOn(ServerCommunication.prototype, "init").mockImplementation(() => {
            return new Promise((res, rej) => { res() });
        });

        jest.spyOn(ProfileManager.prototype, "loadProfile").mockResolvedValue(true);
        jest.spyOn(ServerCommunication.prototype, "getUserAuthPath").mockResolvedValue({ "key": "path" });
        jest.spyOn(ServerCommunication.prototype, "getRlnRoot").mockResolvedValue("test root");

        const initProfileSpy = jest.spyOn(ProfileManager.prototype, "initProfile").mockResolvedValue();

        await init({
                serverUrl: "test1",
                socketUrl: "ws://test2"
            }, 
            "test_id_commitment", 
            ["share_1", "share_2", "share_3", "share_4"], 
            new TestStorageProvider(), 
            new LocalTestCryptography(1000));
        expect(initProfileSpy).toHaveBeenCalled();
    });

    test('get rooms', async () => {
        // No profile
        try {
            await get_rooms();
            expect(true).toBeFalsy();
        } catch(e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();
        jest.spyOn(ProfileManager.prototype, "getRooms").mockResolvedValue({
            public: [],
            private: [],
            direct: []
        });
        const rooms = await get_rooms();
        expect(rooms).not.toBeNull();
    });

    test('send message', async () => {
        // No profile
        try {
            await send_message("test-room-1", "message");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();
        const chatSpy = jest.spyOn(ChatManager.prototype, "sendMessage").mockResolvedValue();
        await send_message("test-room-1", "message");
        expect(chatSpy).toHaveBeenCalled();
    });

    test('receive message', async () => {
        // No profile
        try {
            await receive_message((var1, var2) => {});
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();
        const chatSpy = jest.spyOn(ChatManager.prototype, "registerReceiveMessageHandler").mockResolvedValue();
        await receive_message((var1, var2) => { });
        expect(chatSpy).toHaveBeenCalled();
    });

    test('create public room', async () => {
        // No profile
        try {
            await create_public_room("test room 1");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();

        // Long text
        const randomText1 = randomText(ProfileManager.ROOM_NAME_MAX_LENGTH + 5);
        try {
            await create_public_room(randomText1);
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e).toContain("Room name cannot have more than");
            expect(true).toBeTruthy();
        }

        // Server error
        jest.spyOn(WebCryptography.prototype, "generateSymmetricKey").mockResolvedValue("test symm key");
        jest.spyOn(ServerCommunication.prototype, "createPublicRoom").mockImplementation(async (id, name, symm) => {
            return null;
        });
        try {
            await create_public_room("test room 1");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e).toContain("Server error");
            expect(true).toBeTruthy();
        }

        // Room exists
        jest.spyOn(WebCryptography.prototype, "generateSymmetricKey").mockResolvedValue("test symm key");
        jest.spyOn(ServerCommunication.prototype, "createPublicRoom").mockImplementation(async (id, name, symm) => {
            return "created";
        });
        jest.spyOn(ProfileManager.prototype, "addPublicRoom").mockImplementation(async(room)=> {
            throw "Room already exists"
        })
        try {
            await create_public_room("test room 1");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e).toContain("Room already exists");
            expect(true).toBeTruthy();
        }

        // Success
        jest.spyOn(WebCryptography.prototype, "generateSymmetricKey").mockResolvedValue("test symm key");
        jest.spyOn(ServerCommunication.prototype, "createPublicRoom").mockImplementation(async (id, name, symm) => {
            return "created";
        });
        jest.spyOn(ProfileManager.prototype, "addPublicRoom").mockImplementation(async (room) => {
           
        })
    
        await create_public_room("test room 1");
        expect(true).toBeTruthy();
    });

    test('join public room', async () => {
        // No profile
        try {
            await join_public_room("id-1");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();

        // Room exists
        jest.spyOn(ProfileManager.prototype, "getRoomById").mockResolvedValueOnce("exists");

        try {
            await join_public_room("id-1");
            expect(true).toBeFalsy();
        } catch(e){
            expect(e).toContain("Room already exists as part of your profile");
            expect(true).toBeTruthy();
        }

        // Room doesn't exist on server
        jest.spyOn(ProfileManager.prototype, "getRoomById").mockImplementation(async (id) => {
            throw "Not exists locally"
        });
        jest.spyOn(ServerCommunication.prototype, "getPublicRoom").mockResolvedValue(null);
        try {
            await join_public_room("id-1");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e).toEqual("Unknown room");
            expect(true).toBeTruthy();
        }

        // Joins
        jest.spyOn(ServerCommunication.prototype, "getPublicRoom").mockResolvedValue({
            uuid: "test",
            name: "test",
            symmetric_key: "test",
        });
        const profileManagerSpy = jest.spyOn(ProfileManager.prototype, "addPublicRoom").mockImplementation(async(room) => {});
        await join_public_room("test-1");
        expect(profileManagerSpy).toHaveBeenCalled();
    });

    test('create private room', async () => {
        // No profile
        try {
            await create_private_room("test room 1");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();

        // Long text
        const randomText1 = randomText(ProfileManager.ROOM_NAME_MAX_LENGTH + 5);
        try {
            await create_private_room(randomText1);
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e).toContain("Room name cannot have more than");
            expect(true).toBeTruthy();
        }

        // Room exists
        jest.spyOn(WebCryptography.prototype, "generateSymmetricKey").mockResolvedValue("test symm key");
        jest.spyOn(ProfileManager.prototype, "addPrivateRoom").mockImplementation(async (room) => {
            throw "Room already exists"
        })
        try {
            await create_private_room("test room 1");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e).toContain("Room already exists");
            expect(true).toBeTruthy();
        }

        // Success
        jest.spyOn(WebCryptography.prototype, "generateSymmetricKey").mockResolvedValue("test symm key");
        jest.spyOn(ProfileManager.prototype, "addPrivateRoom").mockImplementation(async (room) => {

        })

        await create_private_room("test room 1");
        expect(true).toBeTruthy();
    });
    
    test('invite private room', async () => {
        // No profile
        try {
            await invite_private_room("id-1", "recepient-key");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();

        // Room doesn't exist
        jest.spyOn(ProfileManager.prototype, "getRoomById").mockImplementation(async (room) => {
            throw "Room doesn't exist"
        });

        try {
            await invite_private_room("id-1", "recepient-key");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e).toContain("Room doesn't exist");
            expect(true).toBeTruthy();
        }

        // Success
        jest.spyOn(WebCryptography.prototype, "encryptMessageAsymmetric").mockResolvedValue("encrypted invite");
        jest.spyOn(ProfileManager.prototype, "getRoomById").mockImplementation(async (room) => {
            return {
                id: "test",
                name: "test",
                type: "test",
                symmetric_key: "test"
            }
        });

        const invitation = await invite_private_room("id-1", "recepient-key");
        expect(invitation).toEqual("encrypted invite");
    });

    test('join private room', async () => {
        // No profile
        try {
            await join_private_room("invite");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();

        jest.spyOn(WebCryptography.prototype, "decryptMessageAsymmetric").mockResolvedValue(JSON.stringify(["test_key", "test_id", "test_name"]));
        jest.spyOn(ProfileManager.prototype, "getPrivateKey").mockResolvedValue("test private key");
        const addPrivateRoomSpy = jest.spyOn(ProfileManager.prototype, "addPrivateRoom").mockImplementation(async (room) => {});

        await join_private_room("invite");
        expect(addPrivateRoomSpy).toHaveBeenCalled();
    });

    test('generate encrypted invite for direct room', async () => {
        // No profile
        try {
            await generate_encrypted_invite_direct_room("id-1");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();
        jest.spyOn(ProfileManager.prototype, "generateEncryptedInviteDirectRoom").mockResolvedValue("encrypted invite");

        const encInvite = await generate_encrypted_invite_direct_room("id-1");
        expect(encInvite).toEqual("encrypted invite");
    });

    test('update direct room key', async () => {
        // No profile
        try {
            await update_direct_room_key("id-1", "enc-key");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();
        const updateSpy = jest.spyOn(ProfileManager.prototype, "updateDirectRoomKey").mockImplementation(async (roomId, key) => {});
        
        await update_direct_room_key("id-1", "enc-key");
        expect(updateSpy).toHaveBeenCalled();
    });

    test('create direct room', async () => {
        // No profile
        try {
            await create_direct_room("test-room", "public key");
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();

        // Long text
        const randomText1 = randomText(ProfileManager.ROOM_NAME_MAX_LENGTH + 5);
        try {
            await create_direct_room(randomText1, "public key")
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e).toContain("Room name cannot have more than");
            expect(true).toBeTruthy();
        }

        // Room exists
        jest.spyOn(WebCryptography.prototype, "generateSymmetricKey").mockResolvedValue("test symm key");
        jest.spyOn(ProfileManager.prototype, "addDirectRoom").mockImplementation(async (room) => {
            throw "Room already exists"
        })
        try {
            await create_direct_room("test room 1", "public key")
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e).toContain("Room already exists");
            expect(true).toBeTruthy();
        }

        // Success
        jest.spyOn(WebCryptography.prototype, "generateSymmetricKey").mockResolvedValue("test symm key");
        const addRoomSpy = jest.spyOn(ProfileManager.prototype, "addDirectRoom").mockImplementation(async (room) => {

        })

        await create_direct_room("test-room", "public key")
        expect(addRoomSpy).toHaveBeenCalled();
    });

    test('get chat history', async () => {
        // No profile
        try {
            await get_public_key();
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();

        jest.spyOn(ProfileManager.prototype, "getRoomIds").mockResolvedValue(["id-1", "id-2"]);
        jest.spyOn(ServerCommunication.prototype, "getChatHistory").mockResolvedValue([
            {
                uuid: "id-1",
                message: "encrypted message 1",
                epoch: 1
            },
            {
                uuid: "id-2",
                message: "encrypted message 2",
                epoch: 2
            },
            {
                uuid: "id-3",
                message: "encrypted message 2",
                epoch: 3
            }
        ]);
        jest.spyOn(ChatManager.prototype, "decryptMessage").mockImplementation(async(message)=> {
            if (message.uuid == 'id-1') {
                return [{
                    uuid: "id-1",
                    message: "Decrypted 1",
                    epoch: 1
                }, 'room-1'];
            }
            if (message.uuid == 'id-2') {
                return [{
                    uuid: "id-2",
                    message: "Decrypted 2",
                    epoch: 2
                }, 'room-1'];
            }
            if (message.uuid == 'id-3') {
                return [{
                    uuid: "id-3",
                    message: "Decrypted 3",
                    epoch: 3
                }, 'room-2'];
            }
        })
        

        const chatHistory = await get_chat_history();
        expect(Object.keys(chatHistory)).toEqual(['room-1', 'room-2']);
        expect(chatHistory['room-1'].length).toEqual(2);
        expect(chatHistory['room-2'].length).toEqual(1);
    });

    test('get public key', async () => {
        // No profile
        try {
            await get_public_key();
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();

        jest.spyOn(ProfileManager.prototype, "getPublicKey").mockResolvedValue("test key");

        expect(await get_public_key()).toEqual("test key");
    });

    test('export profile', async () => {
        // No profile
        try {
            await export_profile();
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();

        jest.spyOn(ProfileManager.prototype, "exportProfile").mockResolvedValue("test profile");

        expect(await export_profile()).toEqual("test profile");
    });

    test('recover profile', async () => {
        // Init not called
        const profile = JSON.stringify({ key: "value" });
        try {
            await recover_profile(profile);
            expect(true).toBeFalsy();
        } catch (e) {
            expect(true).toBeTruthy();
        }

        // With profile
        await init_new_profile();

        // Invalid format
        jest.spyOn(ProfileManager.prototype, "validateFormat").mockResolvedValue(false);

        try {
            await recover_profile(profile);
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e).toEqual("Profile data invalid");
            expect(true).toBeTruthy();
        }

        // Success
        jest.spyOn(ProfileManager.prototype, "validateFormat").mockResolvedValue(true);
        jest.spyOn(ChatManager.prototype, "setRootObsolete").mockImplementation(async() => {});
        jest.spyOn(ChatManager.prototype, "checkRootUpToDate").mockImplementation(async () => { });
        const spy = jest.spyOn(ProfileManager.prototype, "recoverProfile").mockImplementation(async(pr) => {});


        await recover_profile(profile);
        expect(spy).toHaveBeenCalled();
    });

    const init_new_profile = async () => {
        jest.spyOn(ServerCommunication.prototype, "init").mockImplementation(() => {
            return new Promise((res, rej) => { res() });
        });

        jest.spyOn(ProfileManager.prototype, "loadProfile").mockResolvedValue(true);
        jest.spyOn(ServerCommunication.prototype, "getUserAuthPath").mockResolvedValue({ "key": "path" });
        jest.spyOn(ServerCommunication.prototype, "getRlnRoot").mockResolvedValue("test root");

        const initProfileSpy = jest.spyOn(ProfileManager.prototype, "initProfile").mockResolvedValue();

        await init({
            serverUrl: "test1",
            socketUrl: "ws://test2"
        }, "test_id_commitment", ["share_1", "share_2", "share_3", "share_4"]);

        return initProfileSpy;
    }

});