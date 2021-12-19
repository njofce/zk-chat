import axios from 'axios';

class RLNServerApi {

    private server_url: string;

    constructor(server_url: string) {
        this.server_url = server_url;
    }

    public getAllPublicRooms = async (): Promise<any[]> => {
        try {
            const res = await axios({
                method: 'GET',
                url: this.server_url + "/api/v1/public_room/all",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            return res.data;
        } catch (e) {
            return [];
        }
    };

    public getPublicRoom = async (id: string): Promise<any | null> => {
        try {
            const res = await axios({
                method: 'GET',
                url: this.server_url + "/api/v1/public_room/one/" + id,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            return res.data;
        } catch (e) {
            return null;
        }
    };

    public createPublicRoom = async (room_id: string, room_name: string, symmetric_key: string): Promise<any | null> => {
        try {
            const res = await axios({
                method: 'POST',
                url: this.server_url + "/api/v1/public_room/",
                data: {
                    uuid: room_id,
                    name: room_name,
                    symmetric_key: symmetric_key
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            return res.data;
        } catch (e) {
            return null;
        }
    };

    public getChatHistory = async (): Promise<any | null> => {
        try {
            const res = await axios({
                method: 'GET',
                url: this.server_url + "/api/v1/chat/chat_history",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            return res.data;
        } catch (e) {
            return null;
        }
    };

    public getRlnRoot = async (): Promise<any | null> => {
        try {
            const res = await axios({
                method: 'GET',
                url: this.server_url + "/api/v1/user/rln_root",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            return res.data;
        } catch (e) {
            return null;
        }
    };

    public getUserAuthPath = async (id_commitment: string): Promise<any | null> => {
        try {
            const res = await axios({
                method: 'POST',
                url: this.server_url + "/api/v1/user/auth_path",
                data: {
                    identity_commitment: id_commitment
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            return res.data;
        } catch (e) {
            return null;
        }
    };

    public getBannedUsers = async (): Promise<any | null> => {
        try {
            const res = await axios({
                method: 'GET',
                url: this.server_url + "/api/v1/user/banned",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            return res.data;
        } catch (e) {
            return null;
        }
    };

}

export default RLNServerApi;