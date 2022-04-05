import { IProofData } from './../../src/chat/index';
import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'
import ChatManager from '../../src/chat';
import { ServerCommunication } from '../../src/communication';
import RLNServerApi from '../../src/communication/api';
import WsSocketClient from '../../src/communication/ws-socket';
import KeyExchangeManager from '../../src/key-exchange'
import ProfileManager from '../../src/profile';
import "../../src/hasher";
import { ICryptography, IKeyPair } from '../../src/crypto/interfaces';
import { StorageProvider } from '../../src/storage/interfaces';
import { IChatHistoryDB, IMessage } from '../../src/chat/interfaces';
import { deepClone } from '../../src/util';

const ws = require("ws");

const send_message = jest.fn();
const open_event = jest.fn();

const receive_message = jest.fn();

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

jest.mock("ws", () => {
    return jest.fn().mockImplementation(() => {
        return {
            send: (data: any) => {
                send_message(data);
            },
            on: (event: any, callback: any) => {
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

export class TestStorageProvider implements StorageProvider {

    private data: any = {}

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

describe('Key exchange test', () => {

    const proofGeneratorCallback: any = jest.fn();

    let communication: ServerCommunication;
    let server: RLNServerApi;
    let socketClient: WsSocketClient;

    let keyExchangeManager: KeyExchangeManager;
    let profileManager: ProfileManager;
    let storageProvider: TestStorageProvider;
    let cryptography: LocalTestCryptography;
    let chatDB: IChatHistoryDB;
    let chatManager: ChatManager;

    beforeEach(() => {
        storageProvider = new TestStorageProvider();
        cryptography = new LocalTestCryptography(111);
        profileManager = new ProfileManager(storageProvider, cryptography);

        server = new RLNServerApi("");
        socketClient = new WsSocketClient("");
        communication = new ServerCommunication(server, socketClient);
        chatDB = new LocalTestMessageDB();
        chatManager = new ChatManager(profileManager, communication, cryptography, chatDB);

        keyExchangeManager = new KeyExchangeManager(communication, cryptography, chatManager, profileManager, proofGeneratorCallback);
    })

    afterEach(() => {
        jest.useRealTimers();
    });

    test('save bundle', async() => {
        jest.spyOn(profileManager, "getPublicKey").mockResolvedValue("test public key");
        jest.spyOn(cryptography, "generateSymmetricKey").mockResolvedValue("test symm key");
        const encryptMessageSymmetricSpy = jest.spyOn(cryptography, "encryptMessageSymmetric").mockResolvedValue("encrypted asymmetric");
        const encryptMessageAsymmetricSpy = jest.spyOn(cryptography, "encryptMessageAsymmetric").mockResolvedValue("encrypted asymmetric");

        jest.spyOn(cryptography, "hash").mockReturnValue("hashed");
        jest.spyOn(chatManager, "generateProof").mockImplementation(async(proofGeneratorCallback: any) => {
            const proofData: IProofData = JSON.parse(JSON.stringify({
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
                },
                xShare: "x_share",
                epoch: "123"
            }));

            return proofData;
        });

        const saveKeyExchangeBundleSpy = jest.spyOn(communication, "saveKeyExchangeBundle").mockResolvedValue({});

        await keyExchangeManager.saveKeyExchangeBundle("test 1", "test 2");

        expect(encryptMessageSymmetricSpy).toHaveBeenCalled();
        expect(encryptMessageAsymmetricSpy).toHaveBeenCalled();
        expect(saveKeyExchangeBundleSpy).toHaveBeenCalled();
    })

    test('Sync bundles', async () => {
        jest.useFakeTimers();
        
        const getRoomsSpy = jest.spyOn(profileManager, "getAllRoomsAvailableForKeyExchange").mockReturnValue([
            {
                id: "id-1",
                name: "name-1",
                type: "DIRECT",
                symmetric_key: "",
                dh_public_key: "dh-pub-1",
                dh_private_key: "dh-priv-1",
                recipient_public_key: "rec-2"
            },
            {
                id: "id-2",
                name: "name-2",
                type: "DIRECT",
                symmetric_key: "",
                dh_public_key: "dh-pub-2",
                dh_private_key: "dh-priv-2",
                recipient_public_key: "rec-3"
            },
            {
                id: "id-3",
                name: "name-3",
                type: "DIRECT",
                symmetric_key: "",
                dh_public_key: "dh-pub-3",
                dh_private_key: "dh-priv-3",
                recipient_public_key: "rec-4"
            }
        ]);

        jest.spyOn(profileManager, "getPublicKey").mockResolvedValue("pub-1");
        jest.spyOn(profileManager, "getPrivateKey").mockResolvedValue("priv-1");
        
        jest.spyOn(cryptography, "hash").mockReturnValue("content hash");
        
            jest.spyOn(communication, "getKeyExchangeBundles").mockImplementation(async(pub) => {
            return [{
            encrypted_content: "enc_content-1",
            encrypted_key: "enc-key-1",
        }]});

        jest.spyOn(cryptography, "decryptMessageAsymmetric").mockResolvedValue("decrypted symmetric key");
        jest.spyOn(cryptography, "decryptMessageSymmetric").mockResolvedValue(JSON.stringify({
            dh_public_key: "rec-3-dh-pub-1",
            sender_public_key: "rec-3"
        }));

        jest.spyOn(profileManager, "deriveRoomSecretKey").mockResolvedValue();

        jest.spyOn(chatManager, "generateProof").mockImplementation(async (proofGeneratorCallback: any) => {
            const proofData: IProofData = JSON.parse(JSON.stringify({
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
                },
                xShare: "x_share",
                epoch: "123"
            }));

            return proofData;
        });

        jest.spyOn(communication, "deleteKeyExchangeBundles").mockResolvedValue(1);

        keyExchangeManager.init();

        jest.advanceTimersByTime(40000);

        expect(getRoomsSpy).toHaveBeenCalled();
    })
})