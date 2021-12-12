import { ISyncMessage } from "./socket/config";

/**
 * A base interface for publishing and subscribing to a specific channel, using a specific implementation.
 */
interface PubSub {

    /**
     * Subscribe to a given channel.
     */
    subscribe(onEventCallback: (data: string) => void);

    /**
     * Publish a raw message to a given channel.
     */
    publish(message: ISyncMessage): void;

    /**
     * Stop the connection to the messaging system that's used in the background.
     */
    stop(): void;

}

export default PubSub