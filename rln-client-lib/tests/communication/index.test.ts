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

});