import { clearDatabase } from '../jest.setup';
import { test, expect, describe, afterEach } from '@jest/globals'
import KeyExchangeBundleRequestStatsService from '../../src/services/key_exchange_bundle_request_service'
import KeyExchangeRequestStats from '../../src/persistence/model/key_exchange_request_stats/key_exchange_request_stats.model';
import { IKeyExchangeRequestStats } from '../../src/persistence/model/key_exchange_request_stats/key_exchange_request_stats.types';
import { IShares } from '../../src/persistence/model/request_stats/request_stats.types';
import { RLNFullProof, RLNPublicSignals, RLN } from 'rlnjs';

const xShare = BigInt(123);
const epoch = BigInt("1637837930000");

const publicSignals: RLNPublicSignals = {
    yShare: BigInt(123).toString(),
    merkleRoot: BigInt(123).toString(),
    internalNullifier: BigInt(1234).toString(),
    signalHash: BigInt(1234).toString(),
    externalNullifier: BigInt(1234).toString(),
}

const zk_proof: RLNFullProof = {
    snarkProof: {
        proof: {
            pi_a: [],
            pi_b: [],
            pi_c: [],
            protocol: "p",
            curve: "c"
        },
        publicSignals,
    },
    epoch: BigInt(1234),
    rlnIdentifier: BigInt(1234),
}

const testKeyExchangeMessage = {
    zk_proof,
    x_share: xShare.toString(),
    epoch: epoch.toString(),
}

const epoch2 = BigInt("1637837920000");
const testKeyExchangeMessage2 = {
    zk_proof,
    x_share: xShare.toString(),
    epoch: epoch2.toString(),
}

//
const testMessages: any[] = [
    testKeyExchangeMessage,
    testKeyExchangeMessage2,
    testKeyExchangeMessage2,
]

describe('Test key exchange bundle request stats service', () => {

    afterEach(async () => {
        await clearDatabase();
    })

    test('save key exchange message', async () => {
        const reqStats = new KeyExchangeBundleRequestStatsService();

        await reqStats.saveMessage(testKeyExchangeMessage.zk_proof, testKeyExchangeMessage.epoch, testKeyExchangeMessage.x_share);

        const allStats: IKeyExchangeRequestStats[] = await KeyExchangeRequestStats.find({});

        expect(allStats.length).toEqual(1);
        expect(allStats[0].nullifier).toEqual("1234");
    });

    test('get shares for key exchange message - exists', async () => {
        const reqStats = new KeyExchangeBundleRequestStatsService();
        await reqStats.saveMessage(testKeyExchangeMessage.zk_proof, testKeyExchangeMessage.epoch, testKeyExchangeMessage.x_share);

        const shares: IShares[] = await reqStats.getRequestStats(testKeyExchangeMessage.epoch, testKeyExchangeMessage.zk_proof);
        expect(shares.length).toEqual(1);
    });

    test('get shares for key exchange message - exist multiple', async () => {
        const reqStats = new KeyExchangeBundleRequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m.zk_proof, m.epoch, m.x_share);
        }

        const shares: IShares[] = await reqStats.getRequestStats(testMessages[1].epoch, testMessages[1].zk_proof);
        expect(shares.length).toEqual(2);
    });

    test('get shares for key exchange message - does not exist', async () => {
        const reqStats = new KeyExchangeBundleRequestStatsService();
        const shares: IShares[] = await reqStats.getRequestStats(testKeyExchangeMessage.epoch, testKeyExchangeMessage.zk_proof);
        expect(shares.length).toEqual(0);
    });

    test('is duplicate', async () => {
        const reqStats = new KeyExchangeBundleRequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m.zk_proof, m.epoch, m.x_share);
        }

        const isDuplicate = await reqStats.isDuplicate(
            zk_proof,
            epoch2.toString(),
            xShare.toString()
        );
        expect(isDuplicate).toBeTruthy();
    });

    test('is not duplicate', async () => {
        const reqStats = new KeyExchangeBundleRequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m.zk_proof, m.epoch, m.x_share);
        }

        const epoch3 = BigInt("1637837140000")
        const isDuplicate = await reqStats.isDuplicate(
            zk_proof,
            epoch3.toString(),
            xShare.toString(),
        );
        expect(isDuplicate).toBeFalsy();
    });

    test('is spam', async () => {
        const reqStats = new KeyExchangeBundleRequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m.zk_proof, m.epoch, m.x_share);
        }

        const isSpam = await reqStats.isSpam(
            zk_proof,
            epoch2.toString(),
            2);

        expect(isSpam).toBeTruthy();
    });

    test('is not spam', async () => {
        const reqStats = new KeyExchangeBundleRequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m.zk_proof, m.epoch, m.x_share);
        }

        const isSpam = await reqStats.isSpam(
            zk_proof,
            epoch2.toString(),
            3);

        expect(isSpam).toBeFalsy();
    });

});
