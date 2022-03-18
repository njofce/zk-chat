import { clearDatabase } from '../jest.setup';
import { test, expect, describe, afterEach, jest, beforeEach } from '@jest/globals'
import PubSub from '../../src/communication/pub_sub';
import UserService from '../../src/services/user.service';
import RequestStatsService from '../../src/services/request_stats.service';
import TestPubSub from '../fixtures/pubsub.mock';
import MessageHandlerService from '../../src/services/message_handler_service';
import MockDate from 'mockdate';
import Hasher from '../../src/util/hasher';
import Message from '../../src/persistence/model/message/message.model';
import { IMessage } from '../../src/persistence/model/message/message.types';
import { RLNPublicSignals } from '@zk-kit/protocols';

describe('Test message handle service', () => {

    let pubSub: PubSub;
    let userService: UserService;
    let requestStatsService: RequestStatsService;
    let hasher: Hasher;

    let messageHandlerService: MessageHandlerService;

    const timestampTodayMs = 1637837920000;

    const publicSignals: RLNPublicSignals = {
        yShare: BigInt(123).toString(),
        merkleRoot: BigInt(123).toString(),
        internalNullifier: BigInt(123).toString(),
        signalHash: BigInt(123).toString(),
        epoch: BigInt(123).toString(),
        rlnIdentifier: BigInt(123).toString()
    }

    beforeEach(async() => {
        pubSub = new TestPubSub();
        userService = new UserService();
        requestStatsService = new RequestStatsService();
        hasher = new Hasher();

        messageHandlerService = new MessageHandlerService(pubSub, userService, requestStatsService, hasher);
    });

    afterEach(async () => {
        MockDate.reset();
        await clearDatabase();
    });

    test('message format invalid', async () => {
        try {
            await messageHandlerService.handleChatMessage(JSON.stringify({randomKey: "value"}));
            expect(false).toBeTruthy();
        } catch(e) {
            expect(e).toEqual("Message format invalid");
        }
    });

    test('message format invalid - bad json', async () => {
        try {
            await messageHandlerService.handleChatMessage("_some bad json");
            expect(false).toBeTruthy();
        } catch (e) {
            expect(e).toEqual("Message format invalid");
        }
    });

    test('epoch invalid, is after server timestamp', async () => {
        try {
            MockDate.set(new Date(timestampTodayMs));
            const object = {
                zk_proof: {
                    proof: {
                        pi_a: [],
                        pi_b: [],
                        pi_c: [],
                        protocol: "p",
                        curve: "c"
                    },
                    publicSignals: publicSignals
                },
                x_share: BigInt(123).toString(),
                epoch: String(timestampTodayMs + 50 * 1000), // message second is 50s after  the server timestamp
                chat_type: "PUBLIC",
                message_content: "encrypted message content",
            };
            await messageHandlerService.handleChatMessage(JSON.stringify(object));
            expect(false).toBeTruthy();
        } catch (e) {
            expect(e).toEqual("Epoch invalid");
        }
    });

    test('epoch invalid, is before server timestamp', async () => {
        try {
            MockDate.set(new Date(timestampTodayMs));
            const object = {
                zk_proof: {
                    proof: {
                        pi_a: [],
                        pi_b: [],
                        pi_c: [],
                        protocol: "p",
                        curve: "c"
                    },
                    publicSignals: publicSignals
                },
                x_share: BigInt(123).toString(),
                epoch: timestampTodayMs - 50 * 1000, // message second is 50s before the server timestamp
                chat_type: "PUBLIC",
                message_content: "encrypted message content",
            };
            await messageHandlerService.handleChatMessage(JSON.stringify(object));
            expect(false).toBeTruthy();
        } catch (e) {
            expect(e).toEqual("Epoch invalid");
        }
    });

    test('duplicate message', async () => {
        try {
            jest.spyOn(requestStatsService, "isDuplicate").mockResolvedValue(true);
            jest.spyOn(hasher, "genExternalNullifier").mockReturnValue(timestampTodayMs + "");
            MockDate.set(new Date(timestampTodayMs + 5)); // current date is 5ms after the configured second
            const object = {
                zk_proof: {
                    proof: {
                        pi_a: [],
                        pi_b: [],
                        pi_c: [],
                        protocol: "p",
                        curve: "c"
                    },
                    publicSignals: publicSignals
                },
                x_share: BigInt(123).toString(),
                epoch: timestampTodayMs,
                chat_type: "PUBLIC",
                message_content: "encrypted message content",
            };
            await messageHandlerService.handleChatMessage(JSON.stringify(object));
            expect(false).toBeTruthy();
        } catch (e) {
            expect(e).toEqual("Message is a duplicate");
        }
    });

    test('zk proof invalid', async () => {
        try {
            jest.spyOn(requestStatsService, "isDuplicate").mockResolvedValue(false);
            jest.spyOn(userService, "getRoot").mockResolvedValue(BigInt(123).toString());
            jest.spyOn(hasher, "verifyProof").mockResolvedValue(false);
            jest.spyOn(hasher, "genExternalNullifier").mockReturnValue(timestampTodayMs + "");
            MockDate.set(new Date(timestampTodayMs + 5)); // current date is 5ms after the configured second
            const object = {
                zk_proof: {
                    proof: {
                        pi_a: [],
                        pi_b: [],
                        pi_c: [],
                        protocol: "p",
                        curve: "c"
                    },
                    publicSignals: publicSignals
                },
                x_share: BigInt(123).toString(),
                epoch: timestampTodayMs,
                chat_type: "PUBLIC",
                message_content: "encrypted message content",
            };
            await messageHandlerService.handleChatMessage(JSON.stringify(object));
            expect(false).toBeTruthy();
        } catch (e) {
            expect(e).toEqual("ZK Proof is invalid, ignoring message");
        }
    });

    test('is spam', async () => {
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
        jest.spyOn(userService, "updateUser").mockResolvedValue();
        const removeUserSpy = jest.spyOn(userService, "removeUser").mockResolvedValue("success");
        jest.spyOn(hasher, "verifyProof").mockResolvedValue(true);
        jest.spyOn(hasher, "retrieveSecret").mockReturnValue(BigInt(100001));
        jest.spyOn(hasher, "poseidonHash").mockReturnValue(BigInt(122010101));

        MockDate.set(new Date(timestampTodayMs + 5)); // current date is 5ms after the configured second
        jest.spyOn(hasher, "genExternalNullifier").mockReturnValue(timestampTodayMs + "");

        try {
            const object = {
                zk_proof: {
                    proof: {
                        pi_a: [],
                        pi_b: [],
                        pi_c: [],
                        protocol: "p",
                        curve: "c"
                    },
                    publicSignals: publicSignals
                },
                x_share: BigInt(123).toString(),
                epoch: timestampTodayMs,
                chat_type: "PUBLIC",
                message_content: "encrypted message content",
            };
            await messageHandlerService.handleChatMessage(JSON.stringify(object));
            expect(removeUserSpy).toBeCalled();
            expect(false).toBeTruthy();
        } catch (e) {
            expect(e).toEqual("Message is a spam, banning user and ignoring message");
        }
    });

    test('valid message', async () => {
        jest.spyOn(requestStatsService, "isDuplicate").mockResolvedValue(false);
        jest.spyOn(requestStatsService, "isSpam").mockResolvedValue(false);
        const pubSubSpy = jest.spyOn(pubSub, "publish");
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
        
        const object = {
            zk_proof: {
                proof: {
                    pi_a: [],
                    pi_b: [],
                    pi_c: [],
                    protocol: "p",
                    curve: "c"
                },
                publicSignals: publicSignals
            },
            x_share: BigInt(123).toString(),
            epoch: timestampTodayMs,
            chat_type: "PUBLIC",
            message_content: "encrypted message content",
        };
        const persistedMessage: IMessage = await messageHandlerService.handleChatMessage(JSON.stringify(object));
        expect(persistedMessage.message_content).toEqual("encrypted message content");
        expect(pubSubSpy).toHaveBeenCalled();

        const allMessages: IMessage[] = await Message.find({});
        expect(allMessages.length).toEqual(1);
    });

});