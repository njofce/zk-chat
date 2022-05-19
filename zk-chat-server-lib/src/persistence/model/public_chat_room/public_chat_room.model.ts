import { IPublicChatRoomDocument, IPublicChatRoomModel } from './public_chat_room.types';
import { model } from "mongoose";
import MessageSchema from './public_chat_room.schema';

const MODEL_NAME = "PublicChatRoom";

const PublicChatRoom: IPublicChatRoomModel = model<
    IPublicChatRoomDocument,
    IPublicChatRoomModel
>(MODEL_NAME, MessageSchema, "public_chat_rooms");

export default PublicChatRoom;
