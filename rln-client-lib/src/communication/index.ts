import RLNServerApi from './api';
import { SocketClient } from './interfaces';

export class ServerCommunication {

    private rln_server: RLNServerApi;
    private socket_client: SocketClient;

    constructor(rlnServerApi: RLNServerApi, socketClient: SocketClient) {
        this.rln_server = rlnServerApi;
        this.socket_client = socketClient;
    }

    public async init() {
        await this.socket_client.waitForConnections();
    }

    public async sendMessage(message: string) {
        await this.socket_client.sendMessage(message);
    }

    public receiveMessage = async (callback: (message: string) => void) => {
        await this.socket_client.receiveMessage(callback);
    }

    public receiveEvent = async (callback: (event: string) => void) => {
        await this.socket_client.receiveEvent(callback);
    }

    public getPublicRooms = async() => {
        return await this.rln_server.getAllPublicRooms();
    }

    public getPublicRoom = async (room_id: string) => {
        return await this.rln_server.getPublicRoom(room_id);
    }

    public createPublicRoom = async (room_id: string, room_name: string, symmetric_key: string) => {
        return await this.rln_server.createPublicRoom(room_id, room_name, symmetric_key);
    }

    public getChatHistory = async (room_ids: string[]) => {
        return await this.rln_server.getChatHistory(room_ids);
    }

    public getRlnRoot = async () => {
        return await this.rln_server.getRlnRoot();
    }

    public getUserAuthPath = async (id_commitment: string) => {
        return await this.rln_server.getUserAuthPath(id_commitment);
    }

    public getBannedUsers = async () => {
        return await this.rln_server.getBannedUsers();
    }
}

export const serverTopics = {
    messageChannel: "messages",
    messageBroadcastChannel: "message-broadcast",
    updatesChannel: "updates"
}