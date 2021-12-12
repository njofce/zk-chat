import PubSub from "./pub_sub";
import { ISyncMessage, SyncType } from "./socket/config";
import SocketServer from "./socket/socket_server";

/**
 * For multi-node deployment of the application, this component subscribes to all the messages received via Redis, and broadcasts them to all
 * the clients connected on the specific node. 
 * 
 * This is a critical component to ensure broadcast to all clients will always happen regardless of the deployment - single-node or multi-node.
 */
class NodeSynchronizer {

    private pubSub: PubSub;
    private socketServer: SocketServer;

    constructor(pubSub: PubSub, socketServer: SocketServer) {
        this.pubSub = pubSub;
        this.socketServer = socketServer;
        this.init()
    }

    /**
     * Subscribes to the events emitted on the pub-sub channel.
     */
    private init(): void {
        this.pubSub.subscribe(this.handleMessageSync.bind(this))
    }

    /**
     * Broadcast the message to all connected clients.
     */
    private handleMessageSync(serializedMessage: string): void {
        const syncMessage: ISyncMessage = JSON.parse(serializedMessage);
        switch (syncMessage.type) {
            case SyncType.MESSAGE:
                this.socketServer.broadcastMessage(syncMessage.message);
                break;
            case SyncType.EVENT:
                this.socketServer.broadcastEvent(syncMessage.message);
                break;
            default:
                this.socketServer.broadcastMessage(syncMessage.message);
        }
    }

}

export default NodeSynchronizer