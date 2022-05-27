import KeyExchangeService, { IPublicKeyExchangeBundle } from '../../src/services/key_exchange_service';
const request = require('supertest');
const express = require('express');
import { getKeyExchangeRouter } from '../../src/controllers';
import { test, expect, describe, afterEach, beforeEach, jest } from '@jest/globals';
import { ICreateBundleMessage, IDeleteBundlesMessage } from '../../src/services/key_exchange_service';
import KeyExchangeBundleRequestStatsService from '../../src/services/key_exchange_bundle_request_service';
import UserService from '../../src/services/user.service';
import { ZKServerConfigBuilder } from '../../src/config';
import Hasher from '../../src/util/hasher';

const testBundles: IPublicKeyExchangeBundle[] = [
    {
        encrypted_content: "test encrypted 1",
        encrypted_key: "test 1",
        receiver_public_key: "test 2"
    },
    {
        encrypted_content: "test encrypted 2",
        encrypted_key: "test 3",
        receiver_public_key: "test 2"
    },
    {
        encrypted_content: "test encrypted 3",
        encrypted_key: "test 4",
        receiver_public_key: "test 2"
    }
]

jest.mock('../../src/services/key_exchange_service', () => {
    return jest.fn().mockImplementation(() => {
        return {
            getBundles(receiverPublicKey: string): Promise<IPublicKeyExchangeBundle[]> {
                return new Promise((res, rej) => {
                    res(testBundles);
                })
            },

            createBundle(createBundleMessage: ICreateBundleMessage): Promise<IPublicKeyExchangeBundle> {
                return new Promise((res, rej) => {
                    if (createBundleMessage.content_hash == 'bad') {
                        rej("internal error");
                    } else {
                        res({
                            encrypted_content: "test encrypted",
                            encrypted_key: "test 1",
                            receiver_public_key: "test 2"
                        });
                    }
                })
            },

            deleteBundles(deleteBundlesMessages: IDeleteBundlesMessage): Promise<number> {
                return new Promise((res, rej) => {
                    if (deleteBundlesMessages.bundles[0].content_hash == 'bad') {
                        rej("not found");
                    }
                    res(1);
                })
            }
        };
    });
});


describe('Test key exchange controller', () => {

    let app: any;

    beforeEach(async () => {
        const config = ZKServerConfigBuilder.get().build();
        const reqStats = new KeyExchangeBundleRequestStatsService();
        const userService = new UserService(config);
        const keyExchangeService = new KeyExchangeService(userService, reqStats, new Hasher(), config);
        const router = getKeyExchangeRouter(keyExchangeService)
        app = express();
        app.use(express.json());
        app.use('/key-exchange', router);
    })

    afterEach(async () => {
    })

    test('get bundles, invalid', (done) => {
        request(app)
            .post('/key-exchange/get-bundles')
            .send({
                invalid: 'test'
            })
            .expect(500)
            .then((response: any) => {
                expect(response.body).toEqual({ "errors": [{ "location": "body", "msg": "Invalid value", "param": "receiver_public_key" }] });
                if (done != null)
                    done();
            });

    })

    test('get bundles, valid', (done) => {
        request(app)
            .post('/key-exchange/get-bundles')
            .send({
                receiver_public_key: 'test 2'
            })
            .expect(200)
            .then((response: any) => {
                expect(response.body).toEqual(testBundles);
                if (done != null)
                    done();
            });
    })

    test('create bundle, invalid', (done) => {
        request(app)
            .post('/key-exchange/create-bundle')
            .send({
                encrypted_content: 'bad',
                content_hash: 'bad',
                encrypted_key: 'bad',
                receiver_public_key: 'bad',
                zk_proof: 'bad',
                epoch: 'test 2',
                x_share: 'test 2'
            })
            .expect(500)
            .then((response: any) => {
                expect(response.body).toEqual("internal error");
                if (done != null)
                    done();
            });
    })

    test('create bundle, valid', (done) => {
        request(app)
            .post('/key-exchange/create-bundle')
            .send({
                encrypted_content: 'not bad',
                content_hash: 'not bad',
                encrypted_key: 'not bad',
                receiver_public_key: 'not bad',
                zk_proof: 'not bad',
                epoch: 'test 2',
                x_share: 'test 2'
            })
            .expect(204)
            .then((response: any) => {
                if (done != null)
                    done();
            });
    })

    test('delete bundles, invalid params', (done) => {
        request(app)
            .delete('/key-exchange/delete-bundles')
            .send({
                bundles: [
                    {
                        content_hash: "bad",
                        receiver_public_key: "bad"
                    }
                ],
                zk_proof: 'not bad'
            })
            .expect(500)
            .then((response: any) => {
                expect(response.body).toEqual({ "errors": [{ "location": "body", "msg": "Invalid value", "param": "epoch" }, { "location": "body", "msg": "Invalid value", "param": "x_share" }] });
                if (done != null)
                    done();
            });
    })

    test('delete bundles, invalid', (done) => {
        request(app)
            .delete('/key-exchange/delete-bundles')
            .send({
                bundles: [
                    {
                        content_hash: "bad",
                        receiver_public_key: "bad"
                    }
                ],
                zk_proof: 'not bad',
                epoch: 'test 2',
                x_share: 'test 2'
            })
            .expect(500)
            .then((response: any) => {
                expect(response.body).toEqual('not found');
                if (done != null)
                    done();
            });
    })

    test('delete bundles, valid', (done) => {
        request(app)
            .delete('/key-exchange/delete-bundles')
            .send({
                bundles: [
                    {
                        content_hash: "good",
                        receiver_public_key: "good"
                    }
                ],
                zk_proof: 'not bad',
                epoch: 'test 2',
                x_share: 'test 2'
            })
            .expect(200)
            .then((response: any) => {
                expect(response.body).toEqual(
                    {
                        deletedItemCount: 1
                    }
                );
                if (done != null)
                    done();
            });
    })

});