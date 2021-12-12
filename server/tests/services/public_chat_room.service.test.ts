import { clearDatabase } from '../jest.setup';
import { test, expect, describe, afterEach } from '@jest/globals'
import PublicChatRoom from "../../src/persistence/model/public_chat_room/public_chat_room.model"
import { IPublicChatRoom } from "../../src/persistence/model/public_chat_room/public_chat_room.types";
import PublicRoomService from '../../src/services/public_room_service';

describe('Test public room service', () => {

    afterEach(async () => {
        await clearDatabase();
    })

    test('get save room', async () => {
        const publicRoomService = new PublicRoomService();

        const room: IPublicChatRoom = await publicRoomService.saveRoom('id-1', 'test-room', 'symmetric-key');

        expect(room).not.toBeNull();
        
        const all_rooms: IPublicChatRoom[] = await publicRoomService.getAllRooms();
        expect(all_rooms.length).toEqual(1);
    });

    test('get all rooms', async () => {
        const publicRoomService = new PublicRoomService();
        
        await insertPublicRoom(1);
        await insertPublicRoom(2);

        const rooms: IPublicChatRoom[] = await publicRoomService.getAllRooms();

        expect(rooms.length).toEqual(2);
        expect(rooms[0].uuid).toEqual('some-id-1');
    });

    test('find room by id - room exists', async () => {
        const publicRoomService = new PublicRoomService();

        await insertPublicRoom(1);

        const room: IPublicChatRoom | null = await publicRoomService.findRoomById('some-id-1');

        expect(room).not.toBeNull();
        expect(room?.name).toEqual('test-name-1');
    });

    test('find room by id - room does not exist', async () => {
        const publicRoomService = new PublicRoomService();

        await insertPublicRoom(1);

        const room: IPublicChatRoom | null = await publicRoomService.findRoomById('some-id-that-does-not-exist');

        expect(room).toBeNull();
    });

});

const insertPublicRoom = async (id: number) => {
    const chatRoom = new PublicChatRoom();
    chatRoom.uuid = "some-id-" + id;
    chatRoom.name = "test-name-" + id;
    chatRoom.symmetric_key = "random_symmetric_key";
    await chatRoom.save();
}