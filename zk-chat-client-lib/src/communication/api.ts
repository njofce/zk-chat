import { RLNFullProof } from '@zk-kit/protocols';
import axios from 'axios';

/**
 * The main interface for communicating with the server via HTTP.
 */
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

    public getTimeRangeChatHistory = async (fromTimestamp: number, toTimestamp: number): Promise<any | null> => {
        try {
            const res = await axios({
                method: 'POST',
                url: this.server_url + "/api/v1/chat/time_range_chat_history",
                data: {
                    from: fromTimestamp,
                    to: toTimestamp
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

    public getLeaves = async (): Promise<string[]> => {
        try {
            const res = await axios({
                method: 'GET',
                url: this.server_url + "/api/v1/user/leaves",
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

    public getKeyExchangeBundles = async (receiver_public_key: string): Promise<any | null> => {
        try {
            const res = await axios({
                method: 'POST',
                url: this.server_url + "/api/v1/key_exchange/get-bundles",
                data: {
                    receiver_public_key: receiver_public_key
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

    public saveKeyExchangeBundle = async (zk_proof: RLNFullProof, epoch: string, x_share: string, encrypted_content: string, content_hash: string, encrypted_key: string, receiver_public_key: string): Promise<any | null> => {
        try {
            const res = await axios({
                method: 'POST',
                url: this.server_url + "/api/v1/key_exchange/create-bundle",
                data: {
                    zk_proof: zk_proof,
                    epoch: epoch,
                    x_share: x_share,
                    encrypted_content: encrypted_content,
                    content_hash: content_hash,
                    encrypted_key: encrypted_key,
                    receiver_public_key: receiver_public_key
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

    public deleteKeyExchangeBundles = async (zk_proof: RLNFullProof, epoch: string, x_share: string, bundles: any[]): Promise<any | null> => {
        try {
            const res = await axios({
                method: 'DELETE',
                url: this.server_url + "/api/v1/key_exchange/delete-bundles",
                data: {
                    zk_proof: zk_proof,
                    epoch: epoch,
                    x_share: x_share,
                    bundles: bundles
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

}

export default RLNServerApi;