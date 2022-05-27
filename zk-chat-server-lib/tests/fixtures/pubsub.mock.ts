import PubSub from "../../src/communication/pub_sub";
import { ISyncMessage } from "../../src/communication/socket/config";

/**
 * Test implementation of the pubsub mechanism.
 */
class TestPubSub implements PubSub {

    private subscribtions: any[] = [];

    constructor() {}

    subscribe(onEventCallback: (data: string) => void) {
        this.subscribtions.push(onEventCallback);
    }
    publish(message: ISyncMessage): void {
        this.subscribtions.forEach(s => s(JSON.stringify(message)));
    }
    stop(): void {
        this.subscribtions = [];
    }
}

export default TestPubSub