import { IPublicChatRoom } from '../../src/persistence/model/public_chat_room/public_chat_room.types';
const request = require('supertest');
const express = require('express');
import { test, expect, describe, afterEach, jest, beforeEach } from '@jest/globals';
import { roomRouter } from '../../src/controllers';

const test_rooms: IPublicChatRoom[] = [
    {
        uuid: 'id-1',
        name: 'test room 1',
        symmetric_key: 'key q'
    },
    {
        uuid: 'id-2',
        name: 'test room 2',
        symmetric_key: 'key 2'
    },
    {
        uuid: 'id-3',
        name: 'test room 3',
        symmetric_key: 'key 3'
    },
]


jest.mock('../../src/services/public_room_service', () => {
    return jest.fn().mockImplementation(() => {
        return {
            saveRoom: (uuid: string, name: string, symmetric_key: string): Promise<IPublicChatRoom> => {
                return new Promise((res, rej) => {
                    if (uuid == 'exists')
                        rej('exists');
                    res({
                        uuid: uuid,
                        name: name,
                        symmetric_key: symmetric_key
                    });
                })
            },
            getAllRooms: (): Promise<IPublicChatRoom[]> => {
                return new Promise((res, rej) => {
                    res(test_rooms);
                })
            },
            findRoomById: (id: string): Promise<IPublicChatRoom | null> => {
                return new Promise((res, rej) => {
                    res(test_rooms.filter(r => r.uuid == id)[0]);
                })
            }
        };
    });
});

describe('Test room controller', () => {

    let app: any;

    beforeEach(async () => {
        app = express();
        app.use(express.json());
        app.use('/room', roomRouter);
    })

    afterEach(async () => {
    })

    test('create room - new', (done) => {
        request(app)
            .post('/room/')
            .send({
                uuid: '123',
                name: '1111',
                symmetric_key: 'test symmetric key'
            })
            .expect(204)
            .then((response: any) => {
                if (done != null)
                    done();
            });
    });

    test('create room - exists', (done) => {
        request(app)
            .post('/room/')
            .send({
                uuid: 'exists',
                name: '1111',
                symmetric_key: 'test symmetric key'
            })
            .expect(500)
            .then((response: any) => {
                expect(response.body).toEqual('Unknown error while creating a public room!');
                if (done != null)
                    done();
            });
    });

    test('get all rooms', (done) => {
        request(app)
            .get('/room/all')
            .expect(200)
            .then((response: any) => {
                expect(response.body).toEqual(test_rooms);
                if (done != null)
                    done();
            });
    });

    test('get one - exists', (done) => {
        request(app)
            .get('/room/one/id-1')
            .expect(200)
            .then((response: any) => {
                expect(response.body).toEqual(test_rooms[0]);
                if (done != null)
                    done();
            });
    });

    test('get one - not exists', (done) => {
        request(app)
            .get('/room/one/no-id')
            .expect(404)
            .then((response: any) => {
                expect(response.body).toEqual(null);
                if (done != null)
                    done();
            });
    });

});
