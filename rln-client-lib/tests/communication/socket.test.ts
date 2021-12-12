import axios, { AxiosStatic } from 'axios'
import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'
import SocketClient from '../../src/communication/ws-socket';
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

describe('Test sockets', () => {

    let socketClient: SocketClient;

    beforeAll(async() => {
        send_message.mockClear();
        open_event.mockClear();
    });

    beforeEach(async() => {
        socketClient = new SocketClient("");
    });

    test('wait for connections', async() => {
        await socketClient.waitForConnections();

        expect(open_event).toHaveBeenCalledTimes(3);
    });

    test('send message', async () => {
        await socketClient.sendMessage("test message");

        expect(send_message).toHaveBeenCalledTimes(1);
        expect(send_message).toHaveBeenCalledWith("test message");
    });

    test('receive message', (done) => {
        const receiveMessageCallback = message => {
            expect(message).toEqual("test message");
            done();
        };

        socketClient.receiveMessage(receiveMessageCallback);
    });

    test('receive event', (done) => {
        const receiveEventCallback = message => {
            expect(message).toEqual("test message");
            done();
        };

        socketClient.receiveEvent(receiveEventCallback);
    });

});