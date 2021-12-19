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

    test('get user auth path', async () => {
        const test_auth_path = {
            "pathElements": [
                "2066509069781532083082870363092240900543210735798842041673598797369005529920",
                "14744269619966411208579211824598458697587494354926760081771325075741142829156",
                "9662123200589238490961864703693175936999483740821756275406537582188083001900",
                "11286972368698509976183087595462810875513684078608517520839298933882497716792",
                "3607627140608796879659380071776844901612302623152076817094415224584923813162",
                "19712377064642672829441595136074946683621277828620209496774504837737984048981",
                "20775607673010627194014556968476266066927294572720319469184847051418138353016",
                "3396914609616007258851405644437304192397291162432396347162513310381425243293",
                "21551820661461729022865262380882070649935529853313286572328683688269863701601",
                "6573136701248752079028194407151022595060682063033565181951145966236778420039",
                "12413880268183407374852357075976609371175688755676981206018884971008854919922",
                "14271763308400718165336499097156975241954733520325982997864342600795471836726",
                "20066985985293572387227381049700832219069292839614107140851619262827735677018",
                "9394776414966240069580838672673694685292165040808226440647796406499139370960",
                "11331146992410411304059858900317123658895005918277453009197229807340014528524"
            ],
            "indices": [
                1,
                0,
                1,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
            ],
            "root": "74965965065918679901097538180629195557235168007885773267322598440523661746"
        };

        mockAxios.mockResolvedValue({
            data: test_auth_path
        });

        const auth_path: any = await rlnServerApi.getUserAuthPath();
        expect(auth_path).toEqual(test_auth_path);
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