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