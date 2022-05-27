import { test, expect, describe } from '@jest/globals'
import { constructRLNMessage } from '../../src/util/types';

describe('Test types', () => {

    test('rln message type - bad 1', async () => {
        try {
            constructRLNMessage({key: "value"});
            expect(false).toBeTruthy();
        } catch(e){
            expect(e).toEqual("Bad message");
        }
    });

    test('rln message type - bad 2', async () => {
        try {
            constructRLNMessage({
                zk_proof: {
                    proof: {
                        pi_a: [],
                        pi_b: [],
                        pi_c: [],
                        protocol: "p",
                        curve: "c"
                    },
                    publicSignals: [BigInt(123).toString(), BigInt(123).toString(), BigInt(123).toString()]
                },
                x_share: BigInt(123).toString(),
                epoch: 12345,
                xShare: BigInt(123).toString(),
                yShare: BigInt(1234).toString(),
                chat_type: "PUBLIC",
                message_content: "encrypted message content",
                sender: "Sender",
                extra_field: "extra"
            });
            expect(false).toBeTruthy();
        } catch (e) {
            expect(e).toEqual("Bad message");
        }
    });

    test('rln message type - good', async () => {
        constructRLNMessage({
            zk_proof: {
                proof: {
                    pi_a: [],
                    pi_b: [],
                    pi_c: [],
                    protocol: "p",
                    curve: "c"
                },
                publicSignals: [BigInt(123).toString(), BigInt(123).toString(), BigInt(123).toString()]
            },
            x_share: BigInt(123).toString(),
            epoch: 12345,
            chat_type: "PUBLIC",
            message_content: "encrypted message content",
            sender: "Sender"
        });
    });

});
