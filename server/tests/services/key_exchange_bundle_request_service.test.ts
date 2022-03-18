import { clearDatabase } from '../jest.setup';
import { test, expect, describe, afterEach } from '@jest/globals'
import KeyExchangeBundleRequestStatsService from '../../src/services/key_exchange_bundle_request_service'
import KeyExchangeRequestStats from '../../src/persistence/model/key_exchange_request_stats/key_exchange_request_stats.model';
import { IKeyExchangeRequestStats } from '../../src/persistence/model/key_exchange_request_stats/key_exchange_request_stats.types';
import { IShares } from '../../src/persistence/model/request_stats/request_stats.types';


const testKeyExchangeMessage: any = {
    zk_proof: {
        proof: {
            pi_a: [],
            pi_b: [],
            pi_c: [],
            protocol: "p",
            curve: "c"
        },
        publicSignals: {
            yShare: BigInt(123).toString(),
            merkleRoot: BigInt(123).toString(),
            internalNullifier: BigInt(1234).toString(),
            signalHash: BigInt(1234).toString(),
            epoch: BigInt(1234).toString(),
            rlnIdentifier: BigInt(1234).toString()
        }
    },
    x_share: BigInt(123).toString(),
    epoch: "1637837920000"
}

const testMessages: any[] = [
    {
        zk_proof: {
            proof: {
                pi_a: [],
                pi_b: [],
                pi_c: [],
                protocol: "p",
                curve: "c"
            },
            publicSignals: {
                yShare: BigInt(123).toString(),
                merkleRoot: BigInt(123).toString(),
                internalNullifier: BigInt(1234).toString(),
                signalHash: BigInt(1234).toString(),
                epoch: BigInt(1234).toString(),
                rlnIdentifier: BigInt(1234).toString()
            }
        },
        x_share: BigInt(123).toString(),
        epoch: "1637837930000"
    },
    {
        zk_proof: {
            proof: {
                pi_a: [],
                pi_b: [],
                pi_c: [],
                protocol: "p",
                curve: "c"
            },
            publicSignals: {
                yShare: BigInt(123).toString(),
                merkleRoot: BigInt(123).toString(),
                internalNullifier: BigInt(1234).toString(),
                signalHash: BigInt(1234).toString(),
                epoch: BigInt(1234).toString(),
                rlnIdentifier: BigInt(1234).toString()
            }
        },
        x_share: BigInt(123).toString(),
        epoch: "1637837920000",
    },
    {
        zk_proof: {
            proof: {
                pi_a: [],
                pi_b: [],
                pi_c: [],
                protocol: "p",
                curve: "c"
            },
            publicSignals: {
                yShare: BigInt(123).toString(),
                merkleRoot: BigInt(123).toString(),
                internalNullifier: BigInt(1234).toString(),
                signalHash: BigInt(1234).toString(),
                epoch: BigInt(1234).toString(),
                rlnIdentifier: BigInt(1234).toString()
            }
        },
        x_share: BigInt(123).toString(),
        epoch: "1637837920000"
    }]

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
            {
                proof: {
                    pi_a: [],
                    pi_b: [],
                    pi_c: [],
                    protocol: "p",
                    curve: "c"
                },
                publicSignals: {
                    yShare: BigInt(123).toString(),
                    merkleRoot: BigInt(123).toString(),
                    internalNullifier: BigInt(1234).toString(),
                    signalHash: BigInt(1234).toString(),
                    epoch: BigInt(1234).toString(),
                    rlnIdentifier: BigInt(1234).toString()
                }
            }, 
            "1637837920000",
            BigInt(123).toString()
        );
        expect(isDuplicate).toBeTruthy();
    });

    test('is not duplicate', async () => {
        const reqStats = new KeyExchangeBundleRequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m.zk_proof, m.epoch, m.x_share);
        }

        const isDuplicate = await reqStats.isDuplicate(
            {
                proof: {
                    pi_a: [],
                    pi_b: [],
                    pi_c: [],
                    protocol: "p",
                    curve: "c"
                },
                publicSignals: {
                    yShare: BigInt(123).toString(),
                    merkleRoot: BigInt(123).toString(),
                    internalNullifier: BigInt(123).toString(),
                    signalHash: BigInt(1234).toString(),
                    epoch: BigInt(1234).toString(),
                    rlnIdentifier: BigInt(1234).toString()
                }
            },
            "1637837140000",
            BigInt(123).toString());
        expect(isDuplicate).toBeFalsy();
    });

    test('is spam', async () => {
        const reqStats = new KeyExchangeBundleRequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m.zk_proof, m.epoch, m.x_share);
        }

        const isSpam = await reqStats.isSpam(
            {
                proof: {
                    pi_a: [],
                    pi_b: [],
                    pi_c: [],
                    protocol: "p",
                    curve: "c"
                },
                publicSignals: {
                    yShare: BigInt(123).toString(),
                    merkleRoot: BigInt(123).toString(),
                    internalNullifier: BigInt(1234).toString(),
                    signalHash: BigInt(1234).toString(),
                    epoch: BigInt(1234).toString(),
                    rlnIdentifier: BigInt(1234).toString()
                }
            },
            "1637837920000", 
            2);

        expect(isSpam).toBeTruthy();
    });

    test('is not spam', async () => {
        const reqStats = new KeyExchangeBundleRequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m.zk_proof, m.epoch, m.x_share);
        }

        const isSpam = await reqStats.isSpam(
            {
                proof: {
                    pi_a: [],
                    pi_b: [],
                    pi_c: [],
                    protocol: "p",
                    curve: "c"
                },
                publicSignals: {
                    yShare: BigInt(123).toString(),
                    merkleRoot: BigInt(123).toString(),
                    internalNullifier: BigInt(123).toString(),
                    signalHash: BigInt(1234).toString(),
                    epoch: BigInt(1234).toString(),
                    rlnIdentifier: BigInt(1234).toString()
                }
            },
            "1637837920000", 
            3);

        expect(isSpam).toBeFalsy();
    });

});
