import { serverTopics } from '.';
import { SocketClient } from './interfaces';

class WebsocketClient implements SocketClient {
    
    private sockets_connected: boolean = false;
    private messages_socket;
    private message_broadcast_socket;
    private updates_socket;

    constructor(server_url: string) {
        this.messages_socket = new WebSocket(server_url + "/" + serverTopics.messageChannel);
        this.message_broadcast_socket = new WebSocket(server_url + "/" + serverTopics.messageBroadcastChannel);
        this.updates_socket = new WebSocket(server_url + "/" + serverTopics.updatesChannel);
    }

    public waitForConnections = async() => {
        await this.waitSpecificSocketConnection(this.messages_socket);
        await this.waitSpecificSocketConnection(this.message_broadcast_socket);
        await this.waitSpecificSocketConnection(this.updates_socket);
        this.sockets_connected = true;
    };

    private waitSpecificSocketConnection = async (socket) => {
        return new Promise((resolve) => {
            socket.addEventListener("open", () => {
                console.log("--web browser connected--");
                resolve(true);
            });
        });
    }

    public sendMessage = async(message: string): Promise<string> => {
        this.messages_socket.send(message);
        return "success";
    }

    public receiveMessage = async(callback: (message: string) => void) => {
        this.message_broadcast_socket.addEventListener('message', function message(data) {
            const bufferData = Buffer.from(data);
            callback(bufferData.toString());
        });
    };

    public receiveEvent = (callback: (event: string) => void) => {
        this.updates_socket.addEventListener('message', function message(data) {
            const bufferData = Buffer.from(data);
            console.log("received update: ", bufferData.toString());
            callback(bufferData.toString());
        });
    };

}

export default WebsocketClient;