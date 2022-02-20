import { IBannedUser } from '../../src/persistence/model/banned_user/banned_user.types';
const request = require('supertest');
const express = require('express');
import { test, expect, describe, afterEach } from '@jest/globals';
import { userRouter } from '../../src/controllers';
import UserService from '../../src/services/user.service';

const test_banned_users: IBannedUser[] = [
    {
        idCommitment: 'id-1',
        leafIndex: 0,
        secret: 'secret 1'
    },
    {
        idCommitment: 'id-2',
        leafIndex: 1,
        secret: 'secret 2'
    }
]

jest.mock('../../src/services/user.service', () => {
    return jest.fn().mockImplementation(() => {
        return {
            getAllBannedUsers: async (): Promise<IBannedUser[]> => {
                return test_banned_users;
            },
            getPath: async(idCommitment: string): Promise<any> => {
                if (idCommitment == "existing")
                    return {"path": 1}
                throw "Not found";
            },
            getLeaves: async(): Promise<string[]> => {
                return ["1", "2", "3"];
            }
        };
    });
});

describe('Test user controller', () => {

    let app: any;

    beforeEach(async () => {
        app = express();
        app.use(express.json());
        app.use('/user', userRouter);
    })

    afterEach(async () => {
    })

    test('get rln root - db empty', (done) => {
        request(app)
            .get('/user/rln_root')
            .expect(500)
            .then((response: any) => {
                expect(response.body).toEqual({});
                done();
            });
    });

    test('get leaves', (done) => {
        request(app)
            .get('/user/leaves')
            .expect(200)
            .then((response: any) => {
                expect(response.body).toEqual(["1", "2", "3"]);
                done();
            });
    })

    test('get banned', (done) => {
        request(app)
            .get('/user/banned')
            .expect(200)
            .then((response: any) => {
                expect(response.body).toEqual(test_banned_users);
                done();
            });
    });

});
