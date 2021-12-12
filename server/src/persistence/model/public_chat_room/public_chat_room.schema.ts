import { IPublicChatRoom, IPublicChatRoomDocument, IPublicChatRoomModel } from './public_chat_room.types';
import { Schema } from "mongoose";
import { getAllChatRooms, getRoomById } from './public_chat_room.statics';

const PublicChatRoomSchemaFields: Record<keyof IPublicChatRoom, any> = {
    uuid: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: false },
    symmetric_key: { type: String, required: true, unique: false },
};

const PublicChatRoomSchema = new Schema<IPublicChatRoomDocument, IPublicChatRoomModel>(
    PublicChatRoomSchemaFields
);

PublicChatRoomSchema.statics.getAllChatRooms = getAllChatRooms;
PublicChatRoomSchema.statics.getRoomById = getRoomById;

export default PublicChatRoomSchema;