import PubSub from "../communication/pub_sub";
import MessageHandlerService from "./message_handler_service";
import PublicRoomService from "./public_room_service";
import UserService from "./user.service";
import ChatService from "./chat.service";
import GroupService from "./group.service";
import RequestStatsService from "./request_stats.service";
import KeyExchangeService from "./key_exchange_service";
import Hasher from "../util/hasher";
import KeyExchangeBundleRequestStatsService from "./key_exchange_bundle_request_service";
import { IZKServerConfig } from "../types";

const hasher = new Hasher();

const publicRoomService = new PublicRoomService();

const chatService = new ChatService();

const groupService = new GroupService();

const requestStatsService = new RequestStatsService();

const keyExchangeRequestStatsService = new KeyExchangeBundleRequestStatsService();

const createUserService = (config: IZKServerConfig) => {
    return new UserService(config);
}

const createKeyExchangeService = (config: IZKServerConfig, userService: UserService, keyExchangeRequestStatsService: KeyExchangeBundleRequestStatsService, hasher: Hasher) => {
    return new KeyExchangeService(userService, keyExchangeRequestStatsService, hasher, config);
}

const createMessageHandler = (config: IZKServerConfig, pubSub: PubSub, userService: UserService, requestStatsService: RequestStatsService) => {
    return new MessageHandlerService(pubSub, userService, requestStatsService, hasher, config);
}

export { 
    createMessageHandler,
    createKeyExchangeService,
    createUserService,
    publicRoomService,
    chatService,
    groupService,
    requestStatsService,
    keyExchangeRequestStatsService
}