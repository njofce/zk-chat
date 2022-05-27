## Server library for anonymous chat using RLN and InterRep

You can install this library in any existing server, though you need to make sure to allocate 2 specific ports for HTTP and Websocket communication. 

Use the following snippet to initialize the server library, using the default configuration.

```
import { initZKChatServer, ZKServerConfigBuilder } from 'zk-chat-server';

const config = ZKServerConfigBuilder.get().build()
initZKChatServer(config);

```

The default configuration is given below, which you can easily configure by overriding the builder configs.

```

serverConfig: IZKServerConfig = {
    interepUrl: "https://kovan.interep.link/api/v1",
    redisHostname: "localhost",
    redisPort: 6379,
    redisPassword: "password",
    redisChannel: "nodeSync",
    dnConnectionString: "mongodb://localhost:27017",
    serverPort: 8080,
    socketServerPort: 8081,
    merkleTreeLevels: 15,
    spamThreshold: 2,
    epochAllowedDelayThreshold: 20,
    interepSyncIntervalSeconds: 300,
    zeroValue: BigInt(0),
    rlnIdentifier: 518137101,
    messagesChannel: "messages",
    messagesBroadcast: "message-broadcast",
    updatesChannel: "updates",
    deleteMessagesOlderThanDays: 5
}

```

A sample app configuration that you can use to load the config from environment variables is shown below:

```
config.ts

import dotenv from 'dotenv';
dotenv.config();

export default {
    INTERREP_BASE_URL: process.env.INTERREP_BASE_URL || "https://api.thegraph.com/subgraphs/name/interrep/kovan",
    INTERREP_V2: process.env.INTERREP_V2 || "https://kovan.interep.link/api",
    REDIS_HOSTNAME: process.env.REDIS_HOSTNAME || "localhost",
    REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379") || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || "password",
    REDIS_CHANNEL: process.env.REDIS_CHANNEL || "nodeSync",
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || "mongodb://localhost:27017",
    SERVER_PORT: parseInt(process.env.SERVER_PORT || "8080") || 8080,
    SOCKET_SERVER_PORT: parseInt(process.env.SOCKET_SERVER_PORT || "8081") || 8081,
    MERKLE_TREE_LEVELS: parseInt(process.env.MERKLE_TREE_LEVELS || "15", 10) || 15,
    SPAM_TRESHOLD: parseInt(process.env.SPAM_TRESHOLD || "2", 2) || 2,
    EPOCH_ALLOWED_DELAY_THRESHOLD: parseInt(process.env.EPOCH_ALLOWED_DELAY_THRESHOLD || "20", 20) || 20,
    INTERREP_SYNC_INTERVAL_SECONDS: parseInt(process.env.INTERREP_SYNC_INTERVAL_SECONDS || "300") || 300,
    ZERO_VALUE: BigInt(0),
    RLN_IDENTIFIER: parseInt(process.env.RLN_IDENTIFIER || "518137101") || 518137101,
    MESSAGES_CHANNEL: process.env.MESSAGES_CHANNEL || "messages",
    MESSAGES_BROADCAST: process.env.MESSAGES_BROADCAST || "message-broadcast",
    UPDATES_CHANNEL: process.env.UPDATES_CHANNEL || "updates",
    DELETE_MESSAGES_OLDER_THAN_DAYS: parseInt(process.env.DELETE_MESSAGES_OLDER_THAN_DAYS || "5") || 5,
};


server.ts

import express from "express";
import { initZKChatServer, ZKServerConfigBuilder } from 'zk-chat-server';
import config from "./config";

var cors = require("cors");

const createAppServer = () => {

    const zkServerConfig = ZKServerConfigBuilder.get()
        .interepUrl(config.INTERREP_V2)
        .redisHostname(config.REDIS_HOSTNAME)
        .redisPort(config.REDIS_PORT)
        .redisPassword(config.REDIS_PASSWORD)
        .redisChannel(config.REDIS_CHANNEL)
        .dnConnectionString(config.DB_CONNECTION_STRING)
        .serverPort(config.SERVER_PORT)
        .socketServerPort(config.SOCKET_SERVER_PORT)
        .merkleTreeLevels(config.MERKLE_TREE_LEVELS)
        .spamThreshold(config.SPAM_TRESHOLD)
        .epochAllowedDelayThreshold(config.EPOCH_ALLOWED_DELAY_THRESHOLD)
        .interepSyncIntervalSeconds(config.INTERREP_SYNC_INTERVAL_SECONDS)
        .zeroValue(config.ZERO_VALUE)
        .rlnIdentifier(config.RLN_IDENTIFIER)
        .messagesChannel(config.MESSAGES_CHANNEL)
        .messagesBroadcast(config.MESSAGES_BROADCAST)
        .updatesChannel(config.UPDATES_CHANNEL)
        .deleteMessagesOlderThanDays(config.DELETE_MESSAGES_OLDER_THAN_DAYS)
        .build()
    initZKChatServer(zkServerConfig);

    const app = express();
    app.use(cors());
    app.options("*", cors());
    
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.send("Chat is healthy");
    });

    return app;
}

export { createAppServer };

```