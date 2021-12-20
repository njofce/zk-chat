
import PublicChatRoom from "../persistence/model/public_chat_room/public_chat_room.model"
import { IPublicChatRoom } from "../persistence/model/public_chat_room/public_chat_room.types";

/**
 * Encapsulates the functionality of handling public rooms.
 */
class PublicRoomService {

    public async saveRoom(uuid: string, name: string, symmetric_key: string) {
        const chat_room = await PublicChatRoom.create({
            uuid: uuid,
            name: name,
            symmetric_key: symmetric_key
        });

        await chat_room.save();

        return chat_room;
    }

    public async getAllRooms(): Promise<IPublicChatRoom[]> {
        return (await PublicChatRoom.getAllChatRooms()).map(room => {
            return {
                uuid: room.uuid,
                name: room.name,
                symmetric_key: room.symmetric_key
            }
        });
    }

    public async findRoomById(id: string): Promise<IPublicChatRoom | null> {
        const result = await PublicChatRoom.getRoomById(id);
        if (result != null) {
            return {
                uuid: result.uuid,
                name: result.name,
                symmetric_key: result.symmetric_key
            }
        } 
        return null;
    }

}

export default PublicRoomService