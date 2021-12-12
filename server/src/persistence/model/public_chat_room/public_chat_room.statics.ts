import { IPublicChatRoomDocument } from './public_chat_room.types';
import PublicChatRoom from "./public_chat_room.model";

export async function getAllChatRooms(this: typeof PublicChatRoom,): Promise<IPublicChatRoomDocument[]> {
    return this.find({}).limit(100);
}

export async function getRoomById(this: typeof PublicChatRoom, id: string): Promise<IPublicChatRoomDocument | null> {
    return this.findOne({ uuid: id });
}