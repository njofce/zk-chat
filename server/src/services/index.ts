import PubSub from "../communication/pub_sub";
import MessageHandlerService from "./message_handler_service";
import PublicRoomService from "./public_room_service";
import UserService from "./user.service";
import ChatService from "./chat.service";
import GroupService from "./group.service";
import RequestStatsService from "./request_stats.service";
import Hasher from "../util/hasher";

const publicRoomService = new PublicRoomService();

const userService = new UserService();

const chatService = new ChatService();

const groupService = new GroupService();

const requestStatsService = new RequestStatsService();

const createMessageHandler = (pubSub: PubSub, userService: UserService, requestStatsService: RequestStatsService) => {
    return new MessageHandlerService(pubSub, userService, requestStatsService, new Hasher());
}

export { createMessageHandler, publicRoomService, userService, chatService, groupService, requestStatsService }