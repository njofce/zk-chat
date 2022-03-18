import { IPublicKeyExchangeBundle } from './../../src/services/key_exchange_service';
import { IKeyExchangeBundle } from './../../src/persistence/model/key_exchange_bundle/key_exchange_bundle.types';
import { clearDatabase } from '../jest.setup';
import { test, expect, describe, afterEach, beforeEach } from '@jest/globals'
import UserService from '../../src/services/user.service';
import KeyExchangeBundleRequestStatsService from '../../src/services/key_exchange_bundle_request_service'
import KeyExchangeService from '../../src/services/key_exchange_service'
import Hasher from '../../src/util/hasher';
import { RLNFullProof, RLNPublicSignals } from '@zk-kit/protocols';
import MockDate from 'mockdate';

describe('Test key exchange service', () => {

    let userService: UserService;
    let requestStatsService: KeyExchangeBundleRequestStatsService;
    let hasher: Hasher;

    let keyExchangeService: KeyExchangeService;

    const timestampTodayMs = 1637837920000;

    const publicSignals: RLNPublicSignals = {
        yShare: BigInt(123).toString(),
        merkleRoot: BigInt(123).toString(),
        internalNullifier: BigInt(123).toString(),
        signalHash: BigInt(123).toString(),
        epoch: BigInt(123).toString(),
        rlnIdentifier: BigInt(123).toString()
    }
    
    const zk_proof: RLNFullProof = {
        proof: {
            pi_a: [],
            pi_b: [],
            pi_c: [],
            protocol: "p",
            curve: "c"
        },
        publicSignals: publicSignals
    };

    beforeEach(async () => {
        userService = new UserService();
        requestStatsService = new KeyExchangeBundleRequestStatsService();
        hasher = new Hasher();

        keyExchangeService = new KeyExchangeService(userService, requestStatsService, hasher);
    });

    afterEach(async () => {
        await clearDatabase();
    })

    test('create bundle - invalid epoch', async() => {
        try {
            MockDate.set(new Date(timestampTodayMs));

            await keyExchangeService.createBundle({
                zk_proof: zk_proof,
                epoch: String(timestampTodayMs + 50 * 1000), // message second is 50s after  the server timestamp
                x_share: BigInt(123).toString(),
                encrypted_content: "test",
                content_hash: "test",
                encrypted_key: "test",
                receiver_public_key: "test"
            });
            expect(false).toBeTruthy();
        } catch(e) {
            expect(true).toBeTruthy();
            expect(e).toContain("Epoch invalid");
        }
    })

    test('create bundle - invalid, duplicate message', async () => {
        try {
            jest.spyOn(requestStatsService, "isDuplicate").mockResolvedValue(true);
            jest.spyOn(hasher, "genExternalNullifier").mockReturnValue(timestampTodayMs + "");
            MockDate.set(new Date(timestampTodayMs + 5)); // current date is 5ms after the configured second

            await keyExchangeService.createBundle({
                zk_proof: zk_proof,
                epoch: String(timestampTodayMs),
                x_share: BigInt(123).toString(),
                encrypted_content: "test",
                content_hash: "test",
                encrypted_key: "test",
                receiver_public_key: "test"
            });
            expect(false).toBeTruthy();
        } catch (e) {
            expect(true).toBeTruthy();
            expect(e).toContain("Message is a duplicate");
        }
    })

    test('create bundle - invalid proof', async () => {
        try {
            jest.spyOn(requestStatsService, "isDuplicate").mockResolvedValue(false);
            jest.spyOn(userService, "getRoot").mockResolvedValue(BigInt(123).toString());
            jest.spyOn(hasher, "verifyProof").mockResolvedValue(false);
            jest.spyOn(hasher, "genExternalNullifier").mockReturnValue(timestampTodayMs + "");
            MockDate.set(new Date(timestampTodayMs + 5)); // current date is 5ms after the configured second

            await keyExchangeService.createBundle({
                zk_proof: zk_proof,
                epoch: String(timestampTodayMs),
                x_share: BigInt(123).toString(),
                encrypted_content: "test",
                content_hash: "test",
                encrypted_key: "test",
                receiver_public_key: "test"
            });
            expect(false).toBeTruthy();
        } catch (e) {
            expect(true).toBeTruthy();
            expect(e).toContain("ZK Proof is invalid, ignoring message");
        }
    })

    test('create bundle - spam proof', async () => {
        try {
            jest.spyOn(requestStatsService, "isDuplicate").mockResolvedValue(false);
            jest.spyOn(requestStatsService, "isSpam").mockResolvedValue(true);
            jest.spyOn(requestStatsService, "getRequestStats").mockResolvedValue([
                {
                    xShare: "1234",
                    yShare: "5678"
                },
                {
                    xShare: "9123",
                    yShare: "4567"
                }
            ]);
            jest.spyOn(userService, "getRoot").mockResolvedValue(BigInt(123).toString());
            jest.spyOn(hasher, "verifyProof").mockResolvedValue(true);
            jest.spyOn(hasher, "retrieveSecret").mockReturnValue(BigInt(100001));
            jest.spyOn(hasher, "poseidonHash").mockReturnValue(BigInt(122010101));

            MockDate.set(new Date(timestampTodayMs + 5)); // current date is 5ms after the configured second
            jest.spyOn(hasher, "genExternalNullifier").mockReturnValue(timestampTodayMs + "");


            await keyExchangeService.createBundle({
                zk_proof: zk_proof,
                epoch: String(timestampTodayMs),
                x_share: BigInt(123).toString(),
                encrypted_content: "test",
                content_hash: "test",
                encrypted_key: "test",
                receiver_public_key: "test"
            });
            expect(false).toBeTruthy();
        } catch (e) {
            expect(true).toBeTruthy();
            expect(e).toContain("Message is a spam, ignoring");
        }
    })

    test('create bundle - valid doesnt exist', async () => {
        spyValidMessage();

        const created = await keyExchangeService.createBundle({
            zk_proof: zk_proof,
            epoch: String(timestampTodayMs),
            x_share: BigInt(123).toString(),
            encrypted_content: "test",
            content_hash: "test",
            encrypted_key: "test",
            receiver_public_key: "test"
        });

        expect(created.encrypted_content).toEqual("test");
        expect(created).toEqual({
            "encrypted_content": "test",
            "encrypted_key": "test",
            "receiver_public_key": "test"
        });
    })

    test('create bundle - valid already exists', async () => {
        spyValidMessage();

        const created = await keyExchangeService.createBundle({
            zk_proof: zk_proof,
            epoch: String(timestampTodayMs),
            x_share: BigInt(123).toString(),
            encrypted_content: "test",
            content_hash: "test",
            encrypted_key: "test",
            receiver_public_key: "test"
        });

        expect(created.encrypted_content).toEqual("test");

        try {
            await keyExchangeService.createBundle({
                zk_proof: zk_proof,
                epoch: String(timestampTodayMs),
                x_share: BigInt(123).toString(),
                encrypted_content: "test",
                content_hash: "test",
                encrypted_key: "test",
                receiver_public_key: "test"
            });
            expect(true).toBeFalsy();
        } catch(e) {
            expect(true).toBeTruthy();
        }
    })

    test('delete bundles - exist', async () => {
        spyValidMessage()
        const created1 = await keyExchangeService.createBundle({
            zk_proof: zk_proof,
            epoch: String(timestampTodayMs),
            x_share: BigInt(123).toString(),
            encrypted_content: "test 1",
            content_hash: "test 1",
            encrypted_key: "test 1-1",
            receiver_public_key: "test 1-2"
        });

        const created2 = await keyExchangeService.createBundle({
            zk_proof: zk_proof,
            epoch: String(timestampTodayMs),
            x_share: BigInt(123).toString(),
            encrypted_content: "test 2",
            content_hash: "test 2",
            encrypted_key: "test 2-1",
            receiver_public_key: "test 2-2"
        });

        const deletedItemCount: number = await keyExchangeService.deleteBundles({
            zk_proof: zk_proof,
            epoch: String(timestampTodayMs),
            x_share: BigInt(123).toString(),
            bundles: [
                {
                    content_hash: "test 2",
                    receiver_public_key: "test 2-2"
                }
            ]
        })

        expect(deletedItemCount).toEqual(1);
    })

    test('delete bundles - doesnt exist', async () => {
        spyValidMessage()
        const deletedItemCount: number = await keyExchangeService.deleteBundles({
            zk_proof: zk_proof,
            epoch: String(timestampTodayMs),
            x_share: BigInt(123).toString(),
            bundles: [
                {
                    content_hash: "test 2",
                    receiver_public_key: "test 2-2"
                }
            ]
        })

        expect(deletedItemCount).toEqual(0);
    })

    test('get bundles', async () => {
        spyValidMessage()
        await keyExchangeService.createBundle({
            zk_proof: zk_proof,
            epoch: String(timestampTodayMs),
            x_share: BigInt(123).toString(),
            encrypted_content: "test 1",
            content_hash: "test 1",
            encrypted_key: "test 1-1",
            receiver_public_key: "test 1-2"
        });

        await keyExchangeService.createBundle({
            zk_proof: zk_proof,
            epoch: String(timestampTodayMs),
            x_share: BigInt(123).toString(),
            encrypted_content: "test 2",
            content_hash: "test 2",
            encrypted_key: "test 2-1",
            receiver_public_key: "test 2-2"
        });

        await keyExchangeService.createBundle({
            zk_proof: zk_proof,
            epoch: String(timestampTodayMs),
            x_share: BigInt(123).toString(),
            encrypted_content: "test 3",
            content_hash: "test 3",
            encrypted_key: "test 3-1",
            receiver_public_key: "test 2-2"
        });

        const bundles: IPublicKeyExchangeBundle[] = await keyExchangeService.getBundles("test 2-2");

        expect(bundles.length).toEqual(2);
    })


    const spyValidMessage = () => {
        jest.spyOn(requestStatsService, "isDuplicate").mockResolvedValue(false);
        jest.spyOn(requestStatsService, "isSpam").mockResolvedValue(false);
        jest.spyOn(requestStatsService, "getRequestStats").mockResolvedValue([
            {
                xShare: "1234",
                yShare: "5678"
            },
            {
                xShare: "9123",
                yShare: "4567"
            }
        ]);
        jest.spyOn(userService, "getRoot").mockResolvedValue(BigInt(123).toString());
        jest.spyOn(hasher, "verifyProof").mockResolvedValue(true);

        MockDate.set(new Date(timestampTodayMs + 5)); // current date is 5ms after the configured second
        jest.spyOn(hasher, "genExternalNullifier").mockReturnValue(timestampTodayMs + "");


    }

});