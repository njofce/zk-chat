import { RLNFullProof } from '@zk-kit/protocols';
import RLNServerApi from './api';
import { SocketClient } from './interfaces';

/**
 * Encapsulates the HTTP and Websocket based communication with the server.
 */
export class ServerCommunication {

    private rln_server: RLNServerApi;
    private socket_client: SocketClient;

    constructor(rlnServerApi: RLNServerApi, socketClient: SocketClient) {
        this.rln_server = rlnServerApi;
        this.socket_client = socketClient;
    }

    public async init(): Promise<void> {
        await this.socket_client.waitForConnections();
    }

    public async sendMessage(message: string) {
        await this.socket_client.sendMessage(message);
    }

    public async receiveMessage(callback: (message: string) => void) {
        await this.socket_client.receiveMessage(callback);
    }

    public async receiveEvent(callback: (event: string) => void) {
        await this.socket_client.receiveEvent(callback);
    }

    public async getPublicRooms() {
        return await this.rln_server.getAllPublicRooms();
    }

    public async getPublicRoom(room_id: string) {
        return await this.rln_server.getPublicRoom(room_id);
    }

    public async createPublicRoom(room_id: string, room_name: string, symmetric_key: string) {
        return await this.rln_server.createPublicRoom(room_id, room_name, symmetric_key);
    }

    public async getChatHistory() {
        return await this.rln_server.getChatHistory();
    }

    public async getTimeRangeChatHistory(from: number, to: number) {
        return await this.rln_server.getTimeRangeChatHistory(from, to);
    }

    public async getRlnRoot() {
        return await this.rln_server.getRlnRoot();
    }

    public async getLeaves() {
        return await this.rln_server.getLeaves();
    }

    public async getBannedUsers() {
        return await this.rln_server.getBannedUsers();
    }

    public async getKeyExchangeBundles(receiver_public_key: string) {
        return await this.rln_server.getKeyExchangeBundles(receiver_public_key);
    }

    public async saveKeyExchangeBundle(zk_proof: RLNFullProof, epoch: string, x_share: string, encrypted_content: string, content_hash: string, encrypted_key: string, receiver_public_key: string) {
        return await this.rln_server.saveKeyExchangeBundle(zk_proof, epoch, x_share, encrypted_content, content_hash, encrypted_key, receiver_public_key);
    }

    public async deleteKeyExchangeBundles(zk_proof: RLNFullProof, epoch: string, x_share: string, bundles: any[]) {
        return await this.rln_server.deleteKeyExchangeBundles(zk_proof, epoch, x_share, bundles);
    }
}

export const serverTopics = {
    messageChannel: "messages",
    messageBroadcastChannel: "message-broadcast",
    updatesChannel: "updates"
}