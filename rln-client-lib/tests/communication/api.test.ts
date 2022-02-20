import axios, { AxiosStatic } from 'axios'
import { jest, test, expect, describe, beforeAll } from '@jest/globals'
import RLNServerApi from '../../src/communication/api';

interface AxiosMock extends AxiosStatic {
    mockResolvedValue: Function
    mockRejectedValue: Function
}

jest.mock('axios')
const mockAxios = axios as AxiosMock

describe('Test api', () => {

    let rlnServerApi;

    beforeAll(async() => {
        rlnServerApi = new RLNServerApi("");
    })

    beforeEach(async() => {
        jest.restoreAllMocks();
    })

    test('get all public rooms', async() => {
        const server_rooms: any[] = [
            {
                uuid: "room1",
                name: "test room 1",
                symmetric_key: "symmetric key 1"
            },
            {
                uuid: "room2",
                name: "test room 2",
                symmetric_key: "symmetric key 2"
            }
        ];

        mockAxios.mockResolvedValue({
            data: server_rooms
        });

        const rooms: any[] = await rlnServerApi.getAllPublicRooms();
        expect(rooms.length).toEqual(2);
    });

    test('get public room', async () => {
        const server_room: any = {
            uuid: "room2",
            name: "test room 2",
            symmetric_key: "symmetric key 2"
        };

        mockAxios.mockResolvedValue({
            data: server_room
        });

        const room: any = await rlnServerApi.getPublicRoom("room2");
        expect(room.uuid).toEqual("room2");
    });

    test('create public room', async () => {
        const room_data: any = {
            uuid: "room3",
            name: "test room 3",
            symmetric_key: "symmetric key 3"
        };

        mockAxios.mockResolvedValue({
            data: "success"
        });

        const room: any = await rlnServerApi.createPublicRoom(room_data.uuid, room_data.name, room_data.symmetric_key);
        expect(room).toEqual("success");
    });

    test('get chat history - null', async () => {
        mockAxios.mockResolvedValue({
            data: null
        });
        const history: any = await rlnServerApi.getChatHistory();
        expect(history).toBeNull();
    });

    test('get chat history', async () => {
        const messages: any[] = [
            {
                uuid: "0001",
                epoch: 4,
                chat_type: "PUBLIC",
                message_content: "encrypted message content"
            },
            {
                uuid: "0002",
                epoch: 5,
                chat_type: "PUBLIC",
                message_content: "encrypted message content"
            },
            {
                uuid: "0003",
                epoch: 6,
                chat_type: "PUBLIC",
                message_content: "encrypted message content"
            }
        ];

        mockAxios.mockResolvedValue({
            data: messages
        });

        const history: any = await rlnServerApi.getChatHistory(["1", "2"]);
        expect(history.length).toEqual(3);
    });

    test('get rln root', async () => {
        mockAxios.mockResolvedValue({
            data: "the rln root"
        });

        const rln_root: any = await rlnServerApi.getRlnRoot();
        expect(rln_root).toEqual("the rln root");
    });

    test('get leaves', async () => {
        mockAxios.mockResolvedValue({
            data: ["1111", "2222"]
        });

        const leaves: any = await rlnServerApi.getLeaves();
        expect(leaves).toEqual(["1111", "2222"]);
    });

    test('get banned users', async () => {
        const banned_users: any[] = [
            {
                idCommitment:  "test id commitment 1",
                leafIndex: 0,
                secret: "test secret 1"
            },
            {
                idCommitment: "test id commitment 2",
                leafIndex: 1,
                secret: "test secret 2"
            },
            {
                idCommitment: "test id commitment 3",
                leafIndex: 2,
                secret: "test secret 3"
            }
        ];

        mockAxios.mockResolvedValue({
            data: banned_users
        });

        const banned: any[] = await rlnServerApi.getBannedUsers();
        expect(banned.length).toEqual(3);
    });

});