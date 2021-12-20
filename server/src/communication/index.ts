import redis, { ClientOpts, RedisClient } from "redis"
import config from "../config"
import SocketServer from "./socket/socket_server"
import RedisPubSub from "./redis/redis_pub_sub";
import { IMessage } from "../persistence/model/message/message.types";
import NodeSynchronizer from "./node_sync";
import PubSub from "./pub_sub";
import { ISocketServerConfig } from "./socket/config";

/**
 * Redis config options for connecting to the cluster.
 */
const redisConfig: ClientOpts = {
    host: config.REDIS_HOSTNAME,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD
}

/**
 * The configuration options for the socket server.
 */
const socketServerConfig: ISocketServerConfig = {
    port: config.SOCKET_SERVER_PORT,
    messageChannel: config.MESSAGES_CHANNEL,
    messageBroadcastChannel: config.MESSAGES_BROADCAST,
    updatesChannel: config.UPDATES_CHANNEL
}

/**
 * Two separate clients for publishing and subscribing to a channel.
 */
const redisPublishClient: RedisClient = redis.createClient(redisConfig);
const redisSubscribeClient: RedisClient = redis.createClient(redisConfig);

const createSocketServer = (callback: (message) => Promise<IMessage>): SocketServer => {
    return new SocketServer(socketServerConfig, callback);
}

const createRedisPubSub = () => {
    return new RedisPubSub(redisPublishClient, redisSubscribeClient, config.REDIS_CHANNEL);
}

const createNodeSync = (pubSub: PubSub, socketServer: SocketServer) => {
    return new NodeSynchronizer(pubSub, socketServer);
}

export { createRedisPubSub, createSocketServer, createNodeSync };