import express, { Router } from "express";
import { createSocketServer, createRedisPubSub, createNodeSync } from "./communication"
import { createMessageHandler, createUserService, groupService, requestStatsService, createKeyExchangeService, keyExchangeRequestStatsService } from "./services"
import { initDb } from "./persistence/db";
import { seedZeros } from "./util/seed";
import { runMessageCleanupJob } from "./jobs/cleanup";
import { chatRouter, roomRouter, getUserRouter, getKeyExchangeRouter } from "./controllers";

import PubSub from "./communication/pub_sub";
import SocketServer from "./communication/socket/socket_server";
import MessageHandlerService from "./services/message_handler_service";
import NodeSynchronizer from "./communication/node_sync";
import InterRepSynchronizer from "./interrep";
import Hasher from "./util/hasher";
import UserService from "./services/user.service";
import KeyExchangeService from "./services/key_exchange_service";
import { IZKServerConfig } from "./types";

var cors = require("cors");

const createServer = (chatRouter: Router, roomRouter: Router, userRouter: Router, keyExchangeRouter: Router) => {

    const app = express();
    app.use(cors());
    app.options("*", cors());
    
    app.use(express.json());

    app.use("/zk-chat/api/chat", chatRouter);
    app.use("/zk-chat/api/user", userRouter);
    app.use("/zk-chat/api/public_room", roomRouter);
    app.use("/zk-chat/api/key_exchange", keyExchangeRouter);


    return app;
}

const initZKChatServer = async (config: IZKServerConfig) => {

    await initDb(config.dnConnectionString);

    await seedZeros(config.zeroValue, config.merkleTreeLevels);

    const redisPubSub: PubSub = createRedisPubSub(config);

    const userService: UserService = createUserService(config);

    const keyExchangeService: KeyExchangeService = createKeyExchangeService(config, userService, keyExchangeRequestStatsService, new Hasher());

    const interRepSynchronizer = new InterRepSynchronizer(redisPubSub, groupService, userService, config);
    await interRepSynchronizer.sync();

    const messageHandler: MessageHandlerService = createMessageHandler(config, redisPubSub, userService, requestStatsService);
    const socketServer: SocketServer = createSocketServer(config, messageHandler.handleChatMessage);

    const nodeSynchronizer: NodeSynchronizer = createNodeSync(redisPubSub, socketServer);

    const app = createServer(chatRouter, roomRouter, getUserRouter(userService), getKeyExchangeRouter(keyExchangeService));

    await runMessageCleanupJob(config);

    app.listen(config.serverPort, () => {
        console.log(`The chat server is running on port ${config.serverPort}!`);
    });
}

export {
    initZKChatServer
};