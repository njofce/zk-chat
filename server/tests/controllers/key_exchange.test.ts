import { IPublicKeyExchangeBundle } from './../../src/services/key_exchange_service';
const request = require('supertest');
const express = require('express');
import { keyExchangeRouter } from '../../src/controllers';
import { test, expect, describe, afterEach } from '@jest/globals';
import { IKeyExchangeBundle } from '../../src/persistence/model/key_exchange_bundle/key_exchange_bundle.types';
import { ICreateBundleMessage, IDeleteBundlesMessage } from '../../src/services/key_exchange_service';

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
        app = express();
        app.use(express.json());
        app.use('/key-exchange', keyExchangeRouter);
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
                done();
            });
    })

});