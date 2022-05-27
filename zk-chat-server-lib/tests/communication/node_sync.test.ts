import TestPubSub from '../fixtures/pubsub.mock';
import NodeSynchronizer from "../../src/communication/node_sync";
import SocketServer from '../../src/communication/socket/socket_server';
import { test, expect, describe, afterEach, jest, beforeEach } from '@jest/globals'
import { IMessage } from '../../src/persistence/model/message/message.types';
import { ISocketServerConfig, SyncType } from '../../src/communication/socket/config';

// Mock socket server and all the uWebsocket.js functionality
const mockBroadcastMessage = jest.fn();
const mockBroadcastEvent = jest.fn();

jest.mock('../../src/communication/socket/socket_server', () => {
    return jest.fn().mockImplementation(() => {
        return { 
            broadcastMessage: mockBroadcastMessage,
            broadcastEvent: mockBroadcastEvent,
        };
    });
});

describe('Test node sync', () => {

    let testPubSub: TestPubSub;
    let socketServer: SocketServer;
    let nodeSynchronizer;
    let messageHandler: (message: string) => Promise<IMessage>;

    const socketServerConfig: ISocketServerConfig = {
        port: 1,
        messageChannel: 'MESSAGES',
        messageBroadcastChannel: 'MESSAGES_BROADCAST',
        updatesChannel: 'UPDATES'
    };

    beforeEach(async() => {
        testPubSub = new TestPubSub();
        socketServer = new SocketServer(socketServerConfig, messageHandler);
        expect(SocketServer).toHaveBeenCalled();
        nodeSynchronizer = new NodeSynchronizer(testPubSub, socketServer);
    })

    afterEach(async () => {
        mockBroadcastMessage.mockClear();
        mockBroadcastEvent.mockClear();
    })

    test('every message received on the pub-sub channel is broadcast', async () => {
        testPubSub.publish({
            type: SyncType.MESSAGE,
            message: 'test message 1'
        });
        expect(mockBroadcastMessage).toHaveBeenCalledTimes(1);

        testPubSub.publish({
            type: SyncType.MESSAGE,
            message: 'test message 2'
        });
        expect(mockBroadcastMessage).toHaveBeenCalledTimes(2);
    });

    test('no broadcast after pub-sub is stopped', async () => {
        testPubSub.publish({
            type: SyncType.MESSAGE,
            message: 'test message 1'
        });
        expect(mockBroadcastMessage).toHaveBeenCalledTimes(1);

        testPubSub.stop();
        testPubSub.publish({
            type: SyncType.MESSAGE,
            message: 'test message 2'
        });
        expect(mockBroadcastMessage).toHaveBeenCalledTimes(1);
    });

    test('event broadcast', async () => {
        testPubSub.publish({
            type: SyncType.EVENT,
            message: 'update event'
        });
        expect(mockBroadcastEvent).toHaveBeenCalledTimes(1);
    });

});
