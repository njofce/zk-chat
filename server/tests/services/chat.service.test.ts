import { clearDatabase } from '../jest.setup';
import { test, expect, describe, afterEach } from '@jest/globals'
import Message from '../../src/persistence/model/message/message.model';
import { IMessage } from '../../src/persistence/model/message/message.types';
import ChatService from '../../src/services/chat.service'

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

});

const insertMessage = async(id: number, epoch: number) => {
    const message1 = new Message();
    message1.uuid = 'some-id-' + id;
    message1.epoch = epoch;
    message1.chat_type = 'PUBLIC';
    message1.message_content = 'some encrypted content here';
    await message1.save();
}