import { serverTopics } from ".";
import { SocketClient } from "./interfaces";

const WebSocket = require('ws');

/**
 * WS-based socket client, intended to be used for testing purposes or when the library needs to be used independencly of the browser application.
 */
class WsSocketClient implements SocketClient {

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
    }

    private waitSpecificSocketConnection = async(socket) => {
        return new Promise((resolve) => {
            socket.on("open", () => {
                console.log("--connected--");
                resolve(true);
            });
        });
    }

    public sendMessage = async(message: string): Promise<string> => {
        this.messages_socket.send(message);
        return "success";
    }

    public receiveMessage = async (callback: (message: string) => void) => {
        this.message_broadcast_socket.on('message', function message(data) {
            const bufferData = Buffer.from(data);
            callback(bufferData.toString());
        });
    }

    public receiveEvent = async (callback: (event: string) => void) => {
        this.updates_socket.on('message', function message(data) {
            const bufferData = Buffer.from(data);
            console.log("received update: ", bufferData.toString());
            callback(bufferData.toString());
        });
    }

}

export default WsSocketClient