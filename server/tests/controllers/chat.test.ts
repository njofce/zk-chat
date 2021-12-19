const request = require('supertest');
const express = require('express');
import { test, expect, describe, afterEach } from '@jest/globals';
import { chatRouter } from '../../src/controllers';
import ChatService from '../../src/services/chat.service';
import { IMessage } from '../../src/persistence/model/message/message.types';

const test_messages: IMessage[] = [
    {
        uuid: 'id-1',
        epoch: 123,
        chat_type: 'PUBLIC',
        message_content: 'encrypted content'
    },
    {
        uuid: 'id-2',
        epoch: 124,
        chat_type: 'PUBLIC',
        message_content: 'encrypted content'
    }
]

jest.mock('../../src/services/chat.service', () => {
    return jest.fn().mockImplementation(() => {
        return {
            getDailyMessages: (room_ids: string[]): Promise<IMessage[]> => {
                return new Promise((res, rej) => {
                    res(test_messages);
                })
            },
        };
    });
});

describe('Test chat controller', () => {
    
    let app: any;

    beforeEach(async () => {
        app = express();
        app.use(express.json());
        app.use('/chat', chatRouter);
    })

    afterEach(async () => {
    })

    test('get chat history', (done) => {
        request(app)
            .get('/chat/chat_history')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response: any) => {
                expect(response.body).toEqual(test_messages);
                done();
            });
    });

});
