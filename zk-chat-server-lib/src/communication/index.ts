import redis, { ClientOpts, RedisClient } from "redis"
import SocketServer from "./socket/socket_server"
import RedisPubSub from "./redis/redis_pub_sub";
import { IMessage } from "../persistence/model/message/message.types";
import NodeSynchronizer from "./node_sync";
import PubSub from "./pub_sub";
import { ISocketServerConfig } from "./socket/config";
import { IZKServerConfig } from "../types";

const createSocketServer = (config: IZKServerConfig, callback: (message) => Promise<IMessage>): SocketServer => {
    const socketServerConfig: ISocketServerConfig = {
        port: config.socketServerPort,
        messageChannel: config.messagesChannel,
        messageBroadcastChannel: config.messagesBroadcast,
        updatesChannel: config.updatesChannel
    }

    return new SocketServer(socketServerConfig, callback);
}

const createRedisPubSub = (config: IZKServerConfig) => {
    const redisConfig: ClientOpts = {
        host: config.redisHostname,
        port: config.redisPort,
        password: config.redisPassword
    }

    const redisPublishClient: RedisClient = redis.createClient(redisConfig);
    const redisSubscribeClient: RedisClient = redis.createClient(redisConfig);

    return new RedisPubSub(redisPublishClient, redisSubscribeClient, config.redisChannel);
}

const createNodeSync = (pubSub: PubSub, socketServer: SocketServer) => {
    return new NodeSynchronizer(pubSub, socketServer);
}

export { createRedisPubSub, createSocketServer, createNodeSync };