import { clearDatabase } from '../jest.setup';
import { test, expect, describe, afterEach, beforeEach } from '@jest/globals'
import Message from '../../src/persistence/model/message/message.model';
import { IMessage } from '../../src/persistence/model/message/message.types';
import ChatService, { ITimeRangeMessages } from '../../src/services/chat.service'

import MockDate from 'mockdate';

describe('Test chat service', () => {

    const timestampTodayMs = 1637837920000;
    
    const msecondsPerDay = 86400000;

    afterEach(async () => {
        MockDate.reset();
        await clearDatabase();
    })

    test('get daily messages - no messages', async () => {
        const chatService = new ChatService();
        const data: IMessage[] = await chatService.getDailyMessages()
        expect(data.length).toEqual(0);
    });

    test('get daily messages - db has only messages for the day', async () => {
        const chatService = new ChatService();

        MockDate.set(new Date(timestampTodayMs));
        await insertMessage(1, timestampTodayMs + 50);

        const data: IMessage[] = await chatService.getDailyMessages();
        expect(data.length).toEqual(1);
    });

    test('get daily messages - db has messages from previous days', async () => {
        const chatService = new ChatService();

        // Insert message from a previous day
        const timestamp = timestampTodayMs - msecondsPerDay;
        MockDate.set(new Date(timestampTodayMs));
        await insertMessage(1, timestamp + 50);

        // Insert message from current day
        MockDate.set(new Date(timestampTodayMs));
        await insertMessage(2, timestampTodayMs + 50);
        
        const data: IMessage[] = await chatService.getDailyMessages();
        expect(data.length).toEqual(1);
    });

    test('get messages in time range - invalid range', async () => {
        jest.setTimeout(30000);
        const chatService = new ChatService();

        try {
            await chatService.getMessagesInTimeRange(new Date(timestampTodayMs), new Date(timestampTodayMs - 10));
            expect(false).toBeTruthy();
        } catch (e: any) {
            expect(true).toBeTruthy();
            expect(e.message).toEqual("Please select valid date range");
        }
    })

    test('get messages in time range - 1', async () => {
        jest.setTimeout(30000);
        const chatService = new ChatService();

        for (let i = 0; i < 100; i++) {
            const timestamp = timestampTodayMs + 60000 * i; // 1 minute apart
            await insertMessage(i, timestamp);
        }

        const lastItemTimestamp = timestampTodayMs + 9 * 60000
        const messageData: ITimeRangeMessages = await chatService.getMessagesInTimeRange(
            new Date(timestampTodayMs), 
            new Date(lastItemTimestamp + 100));

        expect(messageData.messages.length).toEqual(10);
        expect(messageData.returnedFromTimestamp).toEqual(timestampTodayMs);
        expect(messageData.returnedToTimestamp).toEqual(lastItemTimestamp);
    })

    test('get messages in time range - 2', async () => {
        jest.setTimeout(30000);
        const chatService = new ChatService();

        for (let i = 0; i < 100; i++) {
            const timestamp = timestampTodayMs + 60000 * i; // 1 minute apart
            await insertMessage(i, timestamp);
        }

        const lastItemTimestamp = timestampTodayMs + 9 * 60000
        const messageData: ITimeRangeMessages = await chatService.getMessagesInTimeRange(
            new Date(timestampTodayMs + 100),
            new Date(lastItemTimestamp + 100));

        expect(messageData.messages.length).toEqual(10 - 1); // the first one is not returned
        expect(messageData.returnedFromTimestamp).toEqual((timestampTodayMs + 60000));
        expect(messageData.returnedToTimestamp).toEqual(lastItemTimestamp);
    })

    test('get messages in time range - pagination single page', async () => {
        jest.setTimeout(30000);
        const chatService = new ChatService();

        for (let i = 0; i < ChatService.MESSAGE_COUNT_LIMIT + 100; i++) {
            const timestamp = timestampTodayMs + 60000 * i; // 1 minute apart
            await insertMessage(i, timestamp);
        }

        const numberOfMessagesMoreThanLimit = 10;
        const lastItemTimestamp = timestampTodayMs + (ChatService.MESSAGE_COUNT_LIMIT + numberOfMessagesMoreThanLimit) * 60000
        const messageData: ITimeRangeMessages = await chatService.getMessagesInTimeRange(
            new Date(timestampTodayMs),
            new Date(lastItemTimestamp + 100));

        expect(messageData.messages.length).toEqual(ChatService.MESSAGE_COUNT_LIMIT); // no more than limit gets returned
        
        expect(messageData.returnedFromTimestamp).toEqual(timestampTodayMs);
        
        expect(messageData.returnedToTimestamp).toEqual((lastItemTimestamp - (numberOfMessagesMoreThanLimit + 1) * 60000));
    })

    test('get messages in time range - pagination single page no items', async () => {
        jest.setTimeout(30000);
        const chatService = new ChatService();

        const numberOfMessagesMoreThanLimit = 10;
        const lastItemTimestamp = timestampTodayMs + (ChatService.MESSAGE_COUNT_LIMIT + numberOfMessagesMoreThanLimit) * 60000
        const messageData: ITimeRangeMessages = await chatService.getMessagesInTimeRange(
            new Date(timestampTodayMs),
            new Date(lastItemTimestamp + 100));

        expect(messageData.messages.length).toEqual(0);

        expect(messageData.returnedFromTimestamp).toEqual(timestampTodayMs);
        expect(messageData.returnedToTimestamp).toEqual(lastItemTimestamp + 100);
    })

    test('get messages in time range - pagination all pages', async () => {
        jest.setTimeout(30000);
        const chatService = new ChatService();

        for (let i = 0; i < ChatService.MESSAGE_COUNT_LIMIT + 100; i++) {
            const timestamp = timestampTodayMs + 60000 * i; // 1 minute apart
            await insertMessage(i, timestamp);
        }

        let messages: IMessage[] = [];
        const numberOfMessagesMoreThanLimit = 10;
        const lastItemTimestamp = timestampTodayMs + (ChatService.MESSAGE_COUNT_LIMIT + numberOfMessagesMoreThanLimit) * 60000;

        // Pagination needs to load all until now.
        const toTimestamp = new Date();
        let fromTimestamp = new Date(timestampTodayMs);
        let messageData: ITimeRangeMessages = await chatService.getMessagesInTimeRange(fromTimestamp, toTimestamp);
        messages = messages.concat(messageData.messages);

        while(1) {
            if (messageData.messages.length == messageData.limit) {
                fromTimestamp = new Date(messageData.returnedToTimestamp + 1)
                messageData = await chatService.getMessagesInTimeRange(fromTimestamp, toTimestamp);
                messages = messages.concat(messageData.messages);
            } else {
                break;
            }
        }

        expect(messages.length).toEqual(ChatService.MESSAGE_COUNT_LIMIT + 100);
    })


});

const insertMessage = async(id: number, epoch: number) => {
    const message1 = new Message();
    message1.uuid = 'some-id-' + id;
    message1.epoch = epoch;
    message1.chat_type = 'PUBLIC';
    message1.message_content = 'some encrypted content here';
    await message1.save();
}