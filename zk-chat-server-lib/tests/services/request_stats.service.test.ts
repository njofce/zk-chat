import { RLNMessage } from '../../src/util/types';
import { clearDatabase } from '../jest.setup';
import { test, expect, describe, afterEach } from '@jest/globals'
import RequestStatsService from '../../src/services/request_stats.service'

import RequestStats from '../../src/persistence/model/request_stats/request_stats.model';
import { IRequestStats, IShares } from '../../src/persistence/model/request_stats/request_stats.types';

const testMessage: RLNMessage = {
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
    chat_type: "PUBLIC",
    message_content: "encrypted content",
    sender: "Sender"
}

const testMessages: RLNMessage[] = [
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
        epoch: "1637837930000",
        chat_type: "PUBLIC",
        message_content: "encrypted content",
        sender: "Sender"
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
        chat_type: "PUBLIC",
        message_content: "encrypted content",
        sender: "Sender"
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
        chat_type: "PUBLIC",
        message_content: "encrypted content",
        sender: "Sender"
    }]

describe('Test request stats service', () => {

    afterEach(async () => {
        await clearDatabase();
    })

    test('save message', async () => {
        const reqStats = new RequestStatsService();

        await reqStats.saveMessage(testMessage);

        const allStats: IRequestStats [] = await RequestStats.find({});

        expect(allStats.length).toEqual(1);
        expect(allStats[0].nullifier).toEqual("1234");
    });

    test('get shares for message - exists', async () => {
        const reqStats = new RequestStatsService();
        await reqStats.saveMessage(testMessage);
        
        const shares: IShares[] = await reqStats.getRequestStats(testMessage);
        expect(shares.length).toEqual(1);
    });

    test('get shares for message - exist multiple', async () => {
        const reqStats = new RequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m);
        }

        const shares: IShares[] = await reqStats.getRequestStats(testMessages[1]);
        expect(shares.length).toEqual(2);
    });

    test('get shares for message - does not exist', async () => {
        const reqStats = new RequestStatsService();
        const shares: IShares[] = await reqStats.getRequestStats(testMessage);
        expect(shares.length).toEqual(0);
    });

    test('is duplicate', async () => {
        const reqStats = new RequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m);
        }

        const isDuplicate = await reqStats.isDuplicate({
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
            chat_type: "PUBLIC",
            message_content: "encrypted content",
            sender: "Sender"
        });
        expect(isDuplicate).toBeTruthy();
    });

    test('is not duplicate', async () => {
        const reqStats = new RequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m);
        }

        const isDuplicate = await reqStats.isDuplicate({
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
                    internalNullifier: BigInt(123).toString(),
                    signalHash: BigInt(1234).toString(),
                    epoch: BigInt(1234).toString(),
                    rlnIdentifier: BigInt(1234).toString()
                }
            },
            x_share: BigInt(123).toString(),
            epoch: "1637837140000",
            chat_type: "PUBLIC",
            message_content: "encrypted content",
            sender: "Sender"
        });
        expect(isDuplicate).toBeFalsy();
    });

    test('is spam', async () => {
        const reqStats = new RequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m);
        }

        const isSpam = await reqStats.isSpam({
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
            chat_type: "PUBLIC",
            message_content: "encrypted content",
            sender: "Sender"
        }, 2);

        expect(isSpam).toBeTruthy();
    });

    test('is not spam', async () => {
        const reqStats = new RequestStatsService();
        for (let m of testMessages) {
            await reqStats.saveMessage(m);
        }

        const isSpam = await reqStats.isSpam({
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
                    internalNullifier: BigInt(123).toString(),
                    signalHash: BigInt(1234).toString(),
                    epoch: BigInt(1234).toString(),
                    rlnIdentifier: BigInt(1234).toString()
                }
            },
            x_share: BigInt(123).toString(),
            epoch: "1637837920000",
            chat_type: "PUBLIC",
            message_content: "encrypted content",
            sender: "Sender"
        }, 3);

        expect(isSpam).toBeFalsy();
    });

});
