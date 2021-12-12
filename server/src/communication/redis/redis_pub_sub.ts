import { RedisClient } from "redis";
import PubSub from "../pub_sub"
import { ISyncMessage } from "../socket/config";

/**
 * A pub-sub implementation based on Redis, utilizing its pubsub messaging system.
 */
class RedisPubSub implements PubSub {

    private publishClient: RedisClient;
    private subscribeClient: RedisClient;
    private channel: string;

    constructor(publishClient: RedisClient, subscribeClient: RedisClient, channel: string) {
        this.publishClient = publishClient;
        this.subscribeClient = subscribeClient;
        this.channel = channel;
    }

    /**
     * This method listens to all the messages posted on the specified Redis channel, and on each messages invokes the specified
     * callback function.
     * 
     * Unsubscribes if previosly subscribed to any channel.
     * 
     * @param callback the callback function that will be called on new messages received on the specified channel
     */
    subscribe(callback: (data: string) => void) {
        this.subscribeClient.unsubscribe();

        this.subscribeClient.on("message", (receive_channel, message) => {
            if (this.channel == receive_channel)
                callback(message)

        });

        this.subscribeClient.subscribe(this.channel);
    }

    /**
     * Publishes a raw sync message to the specified channel.
     * 
     * @param message the serialized message
     */
    publish(message: ISyncMessage) {
        this.publishClient.publish(this.channel, JSON.stringify(message));
    }

    /**
     * Stops the redis client when the application is exited.
     */
    stop(): void {
        this.publishClient.quit();
        this.subscribeClient.quit();
    }
}

export default RedisPubSub