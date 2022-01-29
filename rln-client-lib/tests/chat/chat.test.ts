import { StorageProvider } from '../../src/storage/interfaces';
import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'
import { ICryptography, IKeyPair } from '../../src/crypto/interfaces';
import ProfileManager from '../../src/profile';
import { ServerCommunication } from '../../src/communication';
import RLNServerApi from '../../src/communication/api';
import WsSocketClient from '../../src/communication/ws-socket';
import ChatManager from '../../src/chat/index';
import MockDate from 'mockdate';

import "../../src/hasher";

const ws = require("ws");

const send_message = jest.fn();
const open_event = jest.fn();

const receive_message = jest.fn();

jest.mock("ws", () => {
    return jest.fn().mockImplementation(() => {
        return {
            send: data => {
                send_message(data);
            },
            on: (event, callback) => {
                if (event == 'open') {
                    open_event(event);
                    callback();
                } else if (event == 'message') {
                    receive_message("test message");
                    callback("test message");
                }
            }
        }
    });
})

/**
 * When running tests with jest, there's an issue with circomlibjs dependencies, related to ethereum utils.
 * Mocking that here with a deterministic mock for posseidon hasher.
 */
jest.mock("../../src/hasher", () => {
    return jest.fn().mockImplementation(() => {
        return {
            genSignalHash: (data: string) => {
                return "111";
            },
            genExternalNullifier: (data: string): string => {
                return data;
            }
        }
    });
})

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
}


describe('Chat test', () => {

    let communication: ServerCommunication;
    let server: RLNServerApi;
    let socketClient: WsSocketClient;
    
    let crypto: ICryptography;
    let storage: StorageProvider;

    let profileManager: ProfileManager;

    let chatManager: ChatManager;

    const proof_generator_callback = async (nullifier: string, signal: string, storage_artifacts: any, rln_identitifer: any): Promise<any> => {
        return JSON.stringify({
            fullProof: {
                proof: {
                    pi_a: "pi_a",
                    pi_b: "pi_b",
                    pi_c: "pi_c",
                    protocol: "p",
                    curve: "c"
                },
                publicSignals: ["1111", "2222", "3333", "4444"]
            }
        });
    }

    beforeEach(async () => {
        crypto = new LocalTestCryptography(123);
        storage = new TestStorageProvider();
        profileManager = new ProfileManager(storage, crypto);

        server = new RLNServerApi("");
        socketClient = new WsSocketClient("");
        communication = new ServerCommunication(server, socketClient);

        chatManager = new ChatManager(profileManager, communication, crypto);

        MockDate.reset();
    });

    test('set root obsolete', async () => {
        await chatManager.setRootObsolete();
        expect(chatManager.isRootObsolete()).toBeTruthy();

        jest.spyOn(communication, "getRlnRoot").mockResolvedValue("test root");
        jest.spyOn(communication, "getLeaves").mockResolvedValue(["111", "222"]);
        jest.spyOn(profileManager, "getIdentityCommitment").mockReturnValue("test id commitment");

        const updateHash = jest.spyOn(profileManager, "updateRootHash");
        const updateLeaves = jest.spyOn(profileManager, "updateLeaves");

        await chatManager.checkRootUpToDate();
        expect(updateHash).toHaveBeenCalled();
        expect(updateLeaves).toHaveBeenCalled();
    });

    test('send message', async () => {
        MockDate.set(new Date(1639339320000));
        jest.spyOn(global.Math, 'random').mockReturnValue(0.1);
        
        jest.spyOn(profileManager, "getLeaves").mockReturnValue(["1111", "2222"]);
        jest.spyOn(profileManager, "getRoomById").mockResolvedValue({type: "PRIVATE"});
        jest.spyOn(profileManager, "encryptMessageForRoom").mockResolvedValue("encrypted message");

        const sendMessageSpy = jest.spyOn(communication, "sendMessage").mockResolvedValue();

        await chatManager.sendMessage("test-room-1", "raw message", proof_generator_callback);

        expect(sendMessageSpy).toHaveBeenCalledTimes(1);
        expect(sendMessageSpy).toHaveBeenCalledWith(JSON.stringify({
            "zk_proof": {
                "proof": {
                    "pi_a": "pi_a",
                    "pi_b": "pi_b",
                    "pi_c": "pi_c",
                    "protocol": "p",
                    "curve": "c"
                },
                "publicSignals": ["1111", "2222", "3333", "4444"]
            },
            "x_share": "111",
            "epoch": "1639339320000",
            "chat_type": "PRIVATE",
            "message_content": "encrypted message"
        }));

    });

    test('register receive message handler', async () => {
        const receiveHandler = (m, r) => { }
        const mockedReceive = jest.spyOn(communication, "receiveMessage").mockResolvedValue();
        
        await chatManager.registerReceiveMessageHandler(receiveHandler);

        expect(mockedReceive).toHaveBeenCalled();
    });

    test('decrypt message - no rooms', async () => {
        jest.spyOn(profileManager, "getUserRoomsForChatType").mockResolvedValue([]);

        const decrypted = await chatManager.decryptMessage("test message");

        expect(decrypted).toEqual([null, null]);
    });

    test('decrypt message - direct', async () => {
        jest.spyOn(profileManager, "getUserRoomsForChatType").mockResolvedValue([
            {
                "id": "test-1",
                "type": "DIRECT",
                "symmetric_key": "test_symm_key",
                "recipient_public_key": "test_public_key"
            }
        ]);

        jest.spyOn(crypto, "decryptMessageSymmetric").mockResolvedValue("decrypted message");

        const decrypted = await chatManager.decryptMessage({
            chat_type: "DIRECT",
            uuid: "1",
            epoch: 12345,
            message_content: "test content"
        });

        expect(decrypted).toStrictEqual([{ "chat_type": "DIRECT", "epoch": 12345, "message_content": "decrypted message", "uuid": "1" }, "test-1"]);
    });

    test('decrypt message - pub or private', async () => {
        jest.spyOn(profileManager, "getUserRoomsForChatType").mockResolvedValue([
            {
                "id": "test-1",
                "type": "PUBLIC",
                "symmetric_key": "test_symmetric_key"
            }
        ]);

        jest.spyOn(crypto, "decryptMessageSymmetric").mockResolvedValue("decrypted message");

        const decrypted = await chatManager.decryptMessage({
            chat_type: "PUBLIC",
            uuid: "1",
            epoch: 12345,
            message_content: "test content"
        });

        expect(decrypted).toStrictEqual([{ "chat_type": "PUBLIC", "epoch": 12345, "message_content": "decrypted message", "uuid": "1" }, "test-1"]);
    });

    test('decrypt message - pub/priv error', async () => {
        jest.spyOn(profileManager, "getUserRoomsForChatType").mockResolvedValue([
            {
                "id": "test-1",
                "type": "PUBLIC",
                "symmetric_key": "test_symmetric_key"
            }
        ]);

        jest.spyOn(crypto, "decryptMessageSymmetric").mockImplementation((data) => {
            throw "error"
        });

        const decrypted = await chatManager.decryptMessage({
            chat_type: "PUBLIC",
            uuid: "1",
            epoch: 12345,
            message_content: "test content"
        });

        expect(decrypted).toEqual([null, null]);
    });

    test('decrypt message - direct error', async () => {
        jest.spyOn(profileManager, "getUserRoomsForChatType").mockResolvedValue([
            {
                "id": "test-1",
                "type": "DIRECT",
                "symmetric_key": "test_symm_key",
                "recipient_public_key": "test_public_key"
            }
        ]);

        jest.spyOn(crypto, "decryptMessageSymmetric").mockImplementation((data) => {
            throw "error"
        });

        const decrypted = await chatManager.decryptMessage({
            chat_type: "DIRECT",
            uuid: "1",
            epoch: 12345,
            message_content: "test content"
        });

        expect(decrypted).toEqual([null, null]);
    });

});