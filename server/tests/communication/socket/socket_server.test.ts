import { test, expect, describe, afterEach } from '@jest/globals'
import { ISocketServerConfig } from '../../../src/communication/socket/config';
import SocketServer from '../../../src/communication/socket/socket_server';

let testConfig;
let messageSubscribeConfig;
const mockBroadcast = jest.fn();

const listen = {
    listen: (port: number, callback: any) => {
        return {
            publish: mockBroadcast
        }
    }
}

jest.mock('uWebSockets.js', () => {
    return {
        App: () => {
            return {
                ws: (data: string, config: any) => {
                    testConfig = config;
                    return {
                        ws: (data: string, config: any) => {
                            messageSubscribeConfig = config;
                            return {
                                ws: (data: string, config: any) => {
                                    return listen;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
})

const mockCallback = jest.fn();

describe('Test socket server', () => {

    let socketServer: SocketServer;
    const socketServerConfig: ISocketServerConfig = {
        port: 1,
        messageChannel: 'MESSAGES',
        messageBroadcastChannel: 'MESSAGES_BROADCAST',
        updatesChannel: 'UPDATES'
    };

    beforeEach(async () => {
        socketServer = new SocketServer(socketServerConfig, mockCallback);
    })

    afterEach(async () => {

    })

    test('Test open', async () => {
        const mockSubscribe = jest.fn();
        messageSubscribeConfig.open({
            subscribe: mockSubscribe
        });
        expect(mockSubscribe).toHaveBeenCalled();
    });

    test('Test message proper serialization', async () => {
        testConfig.message(null, Buffer.from("test message", 'utf8'), false);
        expect(mockCallback).toHaveBeenCalled();
    });

    test('Test message proper serialization - bad', async () => {
        console.log = jest.fn();
        testConfig.message(null, 125, false);
        expect(console.log).toHaveBeenCalledTimes(1);
    });

    test('Test broadcast', async () => {
        socketServer.broadcastEvent("some event");
        expect(mockBroadcast).toHaveBeenCalled();

        socketServer.broadcastMessage("some event");
        expect(mockBroadcast).toHaveBeenCalled();
    });
});
