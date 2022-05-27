import "../../src/hasher";
import RLNServerApi from '../../src/communication/api';
import WsSocketClient from '../../src/communication/ws-socket';
import ChatManager from '../../src/chat/index';
import MockDate from 'mockdate';
import ProfileManager from '../../src/profile';
import { StorageProvider } from '../../src/storage/interfaces';
import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'
import { ICryptography, IKeyPair } from '../../src/crypto/interfaces';
import { ServerCommunication } from '../../src/communication';
import { IChatHistoryDB, IMessage } from '../../src/chat/interfaces';
import { deepClone } from '../../src/util';

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

export class TestStorageProvider implements StorageProvider {

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

export class LocalTestCryptography implements ICryptography {

    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    generateSymmetricKey = async (): Promise<string> => {
        return (this.seed * 10000).toString();
    };

    generateECDHKeyPair = async (): Promise<IKeyPair> => {
        return this.generateKeyPair()
    };

    deriveSharedSecretKey = async (sourcePrivateKey: string, targetPublicKey: string): Promise<string> => {
        return "derived-" + sourcePrivateKey + targetPublicKey;
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
    };

    decryptMessageSymmetric = async (cyphertext: string, symmetricKey: string): Promise<string> => {
        return cyphertext.substr(0, cyphertext.indexOf('___'));
    };

    encryptMessageAsymmetric = async (message: string, publicKey: string): Promise<string> => {
        return message + "___" + publicKey;
    };

    decryptMessageAsymmetric = async (cyphertext: string, privateKey: string): Promise<string> => {
        return cyphertext.substr(0, cyphertext.indexOf('___'));
    };

    hash = (data: string): string => {
        return "hash-" + data;
    }

}

class LocalTestMessageDB implements IChatHistoryDB {

    private messages = {};

    async saveMessage(roomId: string, message: IMessage) {
        if (this.messages[roomId] == undefined) {
            this.messages[roomId] = [deepClone(message)];
        } else {
            this.messages[roomId].push(deepClone(message));
        }
    }

    async getMessagesForRoom(roomId: string, fromTimestamp: number): Promise<any> {
        return this.messages[roomId];
    }

    async getMessagesForRooms(roomIdS: string[], fromTimestamp: number): Promise<any> {
        return {}
    }

    async getMaxTimestampForAllMessages(): Promise<number> {
        return 0;
    }

    async deleteAllMessagesForRoom(roomId: string) {
        this.messages[roomId] = [];
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
    let chatDB: IChatHistoryDB;

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
                publicSignals: {
                    yShare: BigInt(123).toString(),
                    merkleRoot: BigInt(123).toString(),
                    internalNullifier: BigInt(123).toString(),
                    signalHash: BigInt(123).toString(),
                    epoch: BigInt(123).toString(),
                    rlnIdentifier: BigInt(123).toString()
                }
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
        chatDB = new LocalTestMessageDB();

        chatManager = new ChatManager(profileManager, communication, crypto, chatDB);

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
                "fullProof": {
                    "proof": {
                        "pi_a": "pi_a",
                        "pi_b": "pi_b",
                        "pi_c": "pi_c",
                        "protocol": "p",
                        "curve": "c"
                    },
                    "publicSignals": {
                        "yShare": BigInt(123).toString(),
                        "merkleRoot": BigInt(123).toString(),
                        "internalNullifier": BigInt(123).toString(),
                        "signalHash": BigInt(123).toString(),
                        "epoch": BigInt(123).toString(),
                        "rlnIdentifier": BigInt(123).toString()
                    }
                }
            },
            "x_share": "111",
            "epoch": "1639339320000",
            "chat_type": "PRIVATE",
            "message_content": "encrypted message",
            "sender": "anon"
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

        const decrypted = await chatManager.decryptMessage({
            chat_type: "DIRECT",
            uuid: "1",
            epoch: 12345,
            message_content: "test content",
            timestamp: 12345,
            sender: "Sender"
        });

        expect(decrypted).toEqual([null, null]);
    });

    test('decrypt message - direct', async () => {
        jest.spyOn(profileManager, "getUserRoomsForChatType").mockResolvedValue([
            {
                "id": "test-1",
                "type": "DIRECT",
                "symmetric_key": "test_symm_key",
                "recipient_public_key": "test_public_key",
                "dh_public_key": "dh_key_public",
                "dh_private_key": "dh_key_private"
            }
        ]);

        jest.spyOn(crypto, "decryptMessageSymmetric").mockResolvedValue("decrypted message");

        const decrypted = await chatManager.decryptMessage({
            chat_type: "DIRECT",
            uuid: "1",
            epoch: 12345,
            message_content: "test content",
            timestamp: 12345,
            sender: "Sender"
        });

        expect(decrypted).toStrictEqual([{ "chat_type": "DIRECT", "epoch": 12345, "message_content": "decrypted message", "sender": "Sender", "timestamp": 12345, "uuid": "1" }, "test-1"]);
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
            message_content: "test content",
            timestamp: 12345,
            sender: "Sender"
        });

        expect(decrypted).toStrictEqual([{ "chat_type": "PUBLIC", "epoch": 12345, "message_content": "decrypted message", "sender": "Sender", "timestamp": 12345, "uuid": "1" }, "test-1"]);
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
            message_content: "test content",
            timestamp: 12345,
            sender: "Sender"
        });

        expect(decrypted).toEqual([null, null]);
    });

    test('decrypt message - direct error', async () => {
        jest.spyOn(profileManager, "getUserRoomsForChatType").mockResolvedValue([
            {
                "id": "test-1",
                "type": "DIRECT",
                "symmetric_key": "test_symm_key",
                "recipient_public_key": "test_public_key",
                "dh_public_key": "dh_key_public",
                "dh_private_key": "dh_key_private"
            }
        ]);

        jest.spyOn(crypto, "decryptMessageSymmetric").mockImplementation((data) => {
            throw "error"
        });

        const decrypted = await chatManager.decryptMessage({
            chat_type: "DIRECT",
            uuid: "1",
            epoch: 12345,
            message_content: "test content",
            timestamp: 12345,
            sender: "Sender"
        });

        expect(decrypted).toEqual([null, null]);
    });

    test('sync messages for all rooms', async () => {
        jest.spyOn(profileManager, "getUserRoomsForChatType").mockResolvedValue([
            {
                "id": "test-1",
                "type": "PUBLIC",
                "symmetric_key": "test_symmetric_key"
            }
        ]);

        jest.spyOn(communication, "getTimeRangeChatHistory").mockImplementation(async (from: number, to: number) => {

            if (from == 1) {
                return {
                        requestedFromTimestamp: 0,
                        requestedToTimestamp: 10000,
                        returnedFromTimestamp: 0,
                        returnedToTimestamp: 999,
                        messages: [
                            {
                                uuid: "1",
                                epoch: 100,
                                chat_type: "PUBLIC",
                                message_content: "content 1",
                                sender: "Sender"
                            },
                            {
                                uuid: "2",
                                epoch: 400,
                                chat_type: "PUBLIC",
                                message_content: "content 2",
                                sender: "Sender"
                            },
                            {
                                uuid: "3",
                                epoch: 500,
                                chat_type: "PUBLIC",
                                message_content: "content 3",
                                sender: "Sender"
                            },
                            {
                                uuid: "4",
                                epoch: 800,
                                chat_type: "PUBLIC",
                                message_content: "content 4",
                                sender: "Sender"
                            },
                            {
                                uuid: "5",
                                epoch: 999,
                                chat_type: "PUBLIC",
                                message_content: "content 5",
                                sender: "Sender"
                            }
                        ],
                        limit: 5
                };
            } else if (from == 1000) {
                return {
                    requestedFromTimestamp: 1000,
                    requestedToTimestamp: 10000,
                    returnedFromTimestamp: 1000,
                    returnedToTimestamp: 2000,
                    messages: [
                        {
                            uuid: "6",
                            epoch: 1800,
                            chat_type: "PUBLIC",
                            message_content: "content 6",
                            sender: "Sender"
                        },
                        {
                            uuid: "7",
                            epoch: 2000,
                            chat_type: "PUBLIC",
                            message_content: "content 7",
                            sender: "Sender"
                        }
                    ],
                    limit: 5
                };
            }

        });

        jest.spyOn(crypto, "decryptMessageSymmetric").mockImplementation(async (cyphertext: string, symm_key: string) => {
            return cyphertext;
        });

        jest.spyOn(chatDB, "getMaxTimestampForAllMessages").mockResolvedValue(0);

        const toTimestamp = 10000;
        await chatManager.syncMessagesForAllRooms(toTimestamp)

        const allMessages: IMessage[] = await chatDB.getMessagesForRoom("test-1", 1);
        expect(allMessages.length).toEqual(7);

    });

    test('delete messages for a given room', async () => {
        await chatDB.saveMessage('room-1', {
            uuid: "1",
            epoch: 100,
            chat_type: "PUBLIC",
            message_content: "content 1",
            timestamp: 100,
            sender: "Sender"
        });
        await chatDB.saveMessage('room-1', {
            uuid: "2",
            epoch: 102,
            chat_type: "PUBLIC",
            message_content: "content 2",
            timestamp: 102,
            sender: "Sender"
        });
        await chatDB.saveMessage('room-2', {
            uuid: "3",
            epoch: 105,
            chat_type: "PUBLIC",
            message_content: "content 3",
            timestamp: 105,
            sender: "Sender"
        });

        const messagesForRoomBeforeDelete: IMessage[] = await chatManager.loadMessagesForRoom('room-2', 1);
        expect(messagesForRoomBeforeDelete.length).toEqual(1);

        await chatManager.deleteMessageHistoryForRoom('room-2');
        const messagesForRoomAfterDelete: IMessage[] = await chatManager.loadMessagesForRoom('room-2', 1);
        expect(messagesForRoomAfterDelete.length).toEqual(0);
    });

    test('load messages for a given room', async () => {
        await chatDB.saveMessage('room-1', {
            uuid: "1",
            epoch: 100,
            chat_type: "PUBLIC",
            message_content: "content 1",
            timestamp: 100,
            sender: "Sender"
        });
        await chatDB.saveMessage('room-1', {
            uuid: "2",
            epoch: 102,
            chat_type: "PUBLIC",
            message_content: "content 2",
            timestamp: 102,
            sender: "Sender"
        });
        await chatDB.saveMessage('room-2', {
            uuid: "3",
            epoch: 105,
            chat_type: "PUBLIC",
            message_content: "content 3",
            timestamp: 105,
            sender: "Sender"
        });

        const messages: IMessage[] = await chatManager.loadMessagesForRoom('room-1', 1);
        expect(messages.length).toEqual(2);
    })

});