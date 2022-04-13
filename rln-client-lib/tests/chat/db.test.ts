import { LocalChatDB, ZKChatDB } from './../../src/chat/db';
import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'
import { IMessage } from '../../src/chat/interfaces';

describe('Message db test', () => {

    let chatDB: LocalChatDB;
    let testChatDB: ZKChatDB;
    
    beforeEach(async () => {
        testChatDB = new ZKChatDB();
        chatDB = new LocalChatDB();

        await testChatDB.messages.toCollection().delete();
    })

    test('save message', async () => {
        await chatDB.saveMessage('testRoom', {
            uuid: 'id-1',
            epoch: 123,
            chat_type: "PUBLIC",
            message_content: "test message",
            timestamp: 123
        })

        const messageCount = await testChatDB.messages.where('roomId').equals('testRoom').count();
        expect(messageCount).toEqual(1);
    });

    test('get messages for room - room has no messages', async () => {
        const endTimestampOfMessagesInDB = (2 * LocalChatDB.MAX_NUMBER_OF_MESSAGES_TO_FETCH_FROM_DB - 1) * 10 * 1000;
        const messagesForRoom: IMessage[] = await chatDB.getMessagesForRoom('testRoom', endTimestampOfMessagesInDB);
        expect(messagesForRoom.length).toEqual(0);
    });

    test('get messages for room - room has more messages than limit', async () => {
        await saveMessagesForRoom('testRoom', 2 * LocalChatDB.MAX_NUMBER_OF_MESSAGES_TO_FETCH_FROM_DB);

        // End timestamp would be (2 * LocalChatDB.MAX_NUMBER_OF_MESSAGES_TO_FETCH_FROM_DB - 1) * 10 * 1000;

        const endTimestampOfMessagesInDB = (2 * LocalChatDB.MAX_NUMBER_OF_MESSAGES_TO_FETCH_FROM_DB - 1) * 10 * 1000;
        const messagesForRoom: IMessage[] = await chatDB.getMessagesForRoom('testRoom', endTimestampOfMessagesInDB);
        expect(messagesForRoom.length).toEqual(LocalChatDB.MAX_NUMBER_OF_MESSAGES_TO_FETCH_FROM_DB);
        
        expect(messagesForRoom[0].epoch).toEqual(endTimestampOfMessagesInDB - 10 * 1000);
        expect(messagesForRoom[99].epoch).toEqual(endTimestampOfMessagesInDB - 100 * 1000 * 10);
    });

    test('get messages for room - room has less messages than limit', async () => {
        await saveMessagesForRoom('testRoom', 10);

        // End timestamp would be (10 - 1) * 10 * 1000;

        const endTimestampOfMessagesInDB = 10 * 10 * 1000;
        const messagesForRoom: IMessage[] = await chatDB.getMessagesForRoom('testRoom', endTimestampOfMessagesInDB);

        expect(messagesForRoom.length).toEqual(10);
        expect(messagesForRoom[0].epoch).toEqual((messagesForRoom.length - 1) * 10 * 1000);
        expect(messagesForRoom[9].epoch).toEqual(0);
    });

    test('get messages for rooms - room has less messages than limit', async () => {
        saveMessagesForRoom('testRoom1', 10);
        saveMessagesForRoom('testRoom2', 10);

        // End timestamp would be (10 - 1) * 10 * 1000;

        const endTimestampOfMessagesInDB = 10 * 10 * 1000;
        const messagesForRoom: {[key: string]: IMessage[]} = await chatDB.getMessagesForRooms(['testRoom1', 'testRoom2'], endTimestampOfMessagesInDB);

        expect(Object.keys(messagesForRoom).length).toEqual(2);
        expect(Object.keys(messagesForRoom)).toContain('testRoom1');
        expect(Object.keys(messagesForRoom)).toContain('testRoom2');
        
        
    });

    test('get max timestamp', async () => {
        let timestamp = 0; // starting timestamp
        for (let i = 0; i < 100; i++) {
            await chatDB.saveMessage('testRoom', {
                uuid: 'id-' + i,
                epoch: timestamp,
                chat_type: "PUBLIC",
                message_content: "test message " + i,
                timestamp: timestamp
            });

            timestamp += 10 * 1000; // Increase timestamp by 10 seconds for every stored message
        }

        const maxTimestamp = await chatDB.getMaxTimestampForAllMessages();

        expect(maxTimestamp).toEqual((100 - 1) * 10 * 1000);
    });

    test('delete messages - room has messages', async () => {
        await chatDB.saveMessage('testRoom1', {
            uuid: 'id-1',
            epoch: 1,
            chat_type: "PUBLIC",
            message_content: "test message 1",
            timestamp: 1
        });

        await chatDB.saveMessage('testRoom2', {
            uuid: 'id-2',
            epoch: 2,
            chat_type: "PUBLIC",
            message_content: "test message 2",
            timestamp: 2
        });

        await chatDB.saveMessage('testRoom2', {
            uuid: 'id-3',
            epoch: 3,
            chat_type: "PUBLIC",
            message_content: "test message 3",
            timestamp: 3
        });

        await chatDB.deleteAllMessagesForRoom('testRoom2');

        const messagesForRoom1: IMessage[] = await chatDB.getMessagesForRoom('testRoom1', 5);
        expect(messagesForRoom1.length).toEqual(1);

        const messagesForRoom2: IMessage[] = await chatDB.getMessagesForRoom('testRoom2', 5);
        expect(messagesForRoom2.length).toEqual(0);
    });

    const saveMessagesForRoom = async(roomId: string, messageCount: number) => {
        let timestamp = 0; // starting timestamp
        for (let i = 0; i < messageCount; i++) {
            await chatDB.saveMessage(roomId, {
                uuid: 'id-' + i,
                epoch: timestamp,
                chat_type: "PUBLIC",
                message_content: "test message " + i,
                timestamp: timestamp
            });

            timestamp += 10 * 1000; // Increase timestamp by 10 seconds for every stored message
        }
    }

});