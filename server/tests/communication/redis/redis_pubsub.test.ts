import redis, { RedisClient } from "redis"
import { test, expect, describe, afterEach } from '@jest/globals'
import RedisPubSub from "../../../src/communication/redis/redis_pub_sub";
import { SyncType } from "../../../src/communication/socket/config";

describe('Test redis pub-sub', () => {

    let clientSub: RedisClient;
    let clientPub: RedisClient;
    let pubSub: RedisPubSub;

    const channel: string = "test-channel";
    
    beforeEach(async () => {
        clientSub = redis.createClient();
        clientPub = redis.createClient();
        pubSub = new RedisPubSub(clientPub, clientSub, channel);
    })

    afterEach(async () => {

    })

    test('pub-sub to a test channel', done => {
        const mockSubscribeCallback = (message: string) => {
            expect(message).toBe(JSON.stringify({
                type: SyncType.MESSAGE,
                message: 'some message'
            }));
            done();
        };

        pubSub.subscribe(mockSubscribeCallback);

        pubSub.publish({
            type: SyncType.MESSAGE,
            message: "some message"
        });
    });

    test('pub-sub to another', async () => {
        const mockSubscribeCallback = (message: string) => {
            expect(message).toBe(JSON.stringify({
                type: SyncType.MESSAGE,
                message: 'some message'
            }));
        };

        pubSub.subscribe(mockSubscribeCallback);

        clientSub.publish("x", "y");
        // Nothing happens
    });


});
