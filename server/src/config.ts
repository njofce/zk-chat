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
    UPDATES_CHANNEL: process.env.UPDATES_CHANNEL || "updates"
};