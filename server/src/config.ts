import dotenv from 'dotenv';
dotenv.config();

// const DEFAULT_SEMAPHORE_GROUP = 1
// semaphore group: hash(DEFAULT_SEMAPHORE_GROUP)
// Ref: https://github.com/semaphore-protocol/semaphore/blob/22f33a8f263cb447417faeee68664046b4d716b4/packages/group/src/group.ts#L22
const DEFAULT_ZERO_VALUE = BigInt("312829776796408387545637016147278514583116203736587368460269838669765409292")

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
    MERKLE_TREE_LEVELS: parseInt(process.env.MERKLE_TREE_LEVELS || "16", 10) || 16,
    SPAM_TRESHOLD: parseInt(process.env.SPAM_TRESHOLD || "2", 2) || 2,
    EPOCH_ALLOWED_DELAY_THRESHOLD: parseInt(process.env.EPOCH_ALLOWED_DELAY_THRESHOLD || "20", 20) || 20,
    INTERREP_SYNC_INTERVAL_SECONDS: parseInt(process.env.INTERREP_SYNC_INTERVAL_SECONDS || "300") || 300,
    ZERO_VALUE: DEFAULT_ZERO_VALUE,
    RLN_IDENTIFIER: parseInt(process.env.RLN_IDENTIFIER || "518137101") || 518137101,
    MESSAGES_CHANNEL: process.env.MESSAGES_CHANNEL || "messages",
    MESSAGES_BROADCAST: process.env.MESSAGES_BROADCAST || "message-broadcast",
    UPDATES_CHANNEL: process.env.UPDATES_CHANNEL || "updates",
    DELETE_MESSAGES_OLDER_THAN_DAYS: parseInt(process.env.DELETE_MESSAGES_OLDER_THAN_DAYS || "5") || 5,
};
