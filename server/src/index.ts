import PubSub from "./communication/pub_sub";

import { createSocketServer, createRedisPubSub, createNodeSync } from "./communication"
import { createMessageHandler, groupService, requestStatsService, userService } from "./services"

import { initDb } from "./persistence/db";
import SocketServer from "./communication/socket/socket_server";
import MessageHandlerService from "./services/message_handler_service";
import NodeSynchronizer from "./communication/node_sync";
import { createServer } from "./create_server";
import InterRepSynchronizer from "./interrep";
import { seedZeros } from "./util/seed";
import Hasher from "./util/hasher";

const main = async () => {

    new Hasher();

    await initDb();

    await seedZeros(BigInt(0));

    const redisPubSub: PubSub = createRedisPubSub();
    const interRepSynchronizer = new InterRepSynchronizer(redisPubSub, groupService, userService);
    await interRepSynchronizer.sync();
    
    const messageHandler: MessageHandlerService = createMessageHandler(redisPubSub, userService, requestStatsService);
    const socketServer: SocketServer = createSocketServer(messageHandler.handleChatMessage);
    const nodeSynchronizer: NodeSynchronizer = createNodeSync(redisPubSub, socketServer);

    const app = createServer();
    app.listen(3000, () => {
        console.log(`The chat server is running on port 3000!`);
    });
}

main()