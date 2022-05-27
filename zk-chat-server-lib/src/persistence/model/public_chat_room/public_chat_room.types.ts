import { Model, Document } from "mongoose";
import { getAllChatRooms, getRoomById } from "./public_chat_room.statics";

export interface IPublicChatRoom {
    uuid: string;
    name: string;
    symmetric_key: string;
}

export interface IPublicChatRoomDocument extends IPublicChatRoom, Document {}
export interface IPublicChatRoomModel extends Model<IPublicChatRoomDocument> {
    getAllChatRooms: typeof getAllChatRooms,
    getRoomById: typeof getRoomById
}