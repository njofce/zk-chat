import { ServerCommunication } from '../../src/communication/index';
import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'
import WsSocketClient from '../../src/communication/ws-socket';
import RLNServerApi from '../../src/communication/api';
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

describe('Test server communication', () => {

    const proof = JSON.parse(JSON.stringify({
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
    }));

    let communication: ServerCommunication;
    let server: RLNServerApi;
    let socketClient: WsSocketClient;

    beforeAll(async () => {

    });

    beforeEach(async () => {
        server = new RLNServerApi("");
        socketClient = new WsSocketClient("");
        communication = new ServerCommunication(server, socketClient);
    });

    test('init', async () => {
        const spyWaitConnections = jest.spyOn(socketClient, "waitForConnections");
        spyWaitConnections.mockResolvedValue();
        await communication.init();

        expect(spyWaitConnections).toHaveBeenCalled();
    });

    test('send message', async () => {
        const testSpy = jest.spyOn(socketClient, "sendMessage");
        testSpy.mockResolvedValue("test");
        await communication.sendMessage("test");

        expect(testSpy).toHaveBeenCalled();
    });

    test('receive message', async () => {
        const testSpy = jest.spyOn(socketClient, "receiveMessage");
        testSpy.mockResolvedValue();
        await communication.receiveMessage(() => {});

        expect(testSpy).toHaveBeenCalled();
    });

    test('receive event', async () => {
        const testSpy = jest.spyOn(socketClient, "receiveEvent");
        testSpy.mockResolvedValue();
        await communication.receiveEvent(() => {});

        expect(testSpy).toHaveBeenCalled();
    });

    test('get public rooms', async () => {
        const testSpy = jest.spyOn(server, "getAllPublicRooms");
        testSpy.mockResolvedValue([]);
        await communication.getPublicRooms();

        expect(testSpy).toHaveBeenCalled();
    });

    test('get public room', async () => {
        const testSpy = jest.spyOn(server, "getPublicRoom");
        testSpy.mockResolvedValue({
            id: "room 1"
        });
        await communication.getPublicRoom("1");

        expect(testSpy).toHaveBeenCalled();
    });

    test('create public room', async () => {
        const testSpy = jest.spyOn(server, "createPublicRoom");
        testSpy.mockResolvedValue("success");
        await communication.createPublicRoom("1", "2", "3");

        expect(testSpy).toHaveBeenCalled();
    });

    test('get chat history', async () => {
        const testSpy = jest.spyOn(server, "getChatHistory");
        testSpy.mockResolvedValue([]);
        await communication.getChatHistory();

        expect(testSpy).toHaveBeenCalled();
    });

    test('get time range chat history', async () => {
        const testSpy = jest.spyOn(server, "getTimeRangeChatHistory");
        testSpy.mockResolvedValue([]);
        await communication.getTimeRangeChatHistory(1, 2);

        expect(testSpy).toHaveBeenCalledWith(1, 2);
    })

    test('get rln root', async () => {
        const testSpy = jest.spyOn(server, "getRlnRoot");
        testSpy.mockResolvedValue("test root");
        await communication.getRlnRoot();

        expect(testSpy).toHaveBeenCalled();
    });

    test('get leaves', async () => {
        const testSpy = jest.spyOn(server, "getLeaves");
        testSpy.mockResolvedValue([]);
        await communication.getLeaves();

        expect(testSpy).toHaveBeenCalled();
    });

    test('get banned users', async () => {
        const testSpy = jest.spyOn(server, "getBannedUsers");
        testSpy.mockResolvedValue([]);
        await communication.getBannedUsers();

        expect(testSpy).toHaveBeenCalled();
    });
    

    test('save key exchange bundle', async () => {
        const testSpy = jest.spyOn(server, "saveKeyExchangeBundle");
        testSpy.mockResolvedValue({
            encrypted_content: "enc_content",
            encrypted_key: "key",
            receiver_public_key: "key"
        });
        await communication.saveKeyExchangeBundle(proof, "test", "test", "test", "test", "test", "test");

        expect(testSpy).toHaveBeenCalled();
    });

    test('get key exchange bundles', async () => {
        const testSpy = jest.spyOn(server, "getKeyExchangeBundles");
        testSpy.mockResolvedValue([{
            encrypted_content: "enc_content",
            encrypted_key: "key",
            receiver_public_key: "key"
        }]);
        await communication.getKeyExchangeBundles("test");

        expect(testSpy).toHaveBeenCalled();
    });

    test('delete key exchange bundles', async () => {
        const testSpy = jest.spyOn(server, "deleteKeyExchangeBundles");
        testSpy.mockResolvedValue({
            deletedItemCount: 2
        });
        await communication.deleteKeyExchangeBundles(proof, "test", "test", ["1"]);

        expect(testSpy).toHaveBeenCalled();
    });

});