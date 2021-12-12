import { IMessage } from "../../persistence/model/message/message.types";
import { ISocketServerConfig } from "./config";

import * as uWS from 'uWebSockets.js';

/**
 * Builds a socket-based server using uWebsockets.js
 */
class SocketServer {

    private static IDLE_TIMEOUT: number = 60;
    private static MAX_BACKPRESSURE: number = 1024;
    private static MAX_PAYLOAD_LENGTH: number = 16 * 1024 * 1024;

    private wsApp;
    private serverConfig: ISocketServerConfig;
    private messageHandler: (message) => Promise<IMessage>;

    constructor(config: ISocketServerConfig, messageHandler: (message) => Promise<IMessage>) {
        this.serverConfig = config;
        this.messageHandler = messageHandler;
        this.init();
    }

    private init(): void {
        console.log('Initializing socket server!');
        
        this.wsApp = uWS.App()
        .ws('/' + this.serverConfig.messageChannel, {

            idleTimeout: SocketServer.IDLE_TIMEOUT,
            maxBackpressure: SocketServer.MAX_BACKPRESSURE,
            maxPayloadLength: SocketServer.MAX_PAYLOAD_LENGTH,
            compression: uWS.SHARED_COMPRESSOR,

            open: (ws) => {
                console.log("client connected!");
            },

            message: async (ws, message, isBinary) => {
                console.log("message received!");
                try {
                    const bufferData = Buffer.from(message);
                    console.log("Processing message", bufferData.toString());
                    await this.messageHandler(bufferData.toString());
                    console.log('message processed!')
                } catch(e) {
                    console.log(e);
                    console.log("message invalid");
                    this.broadcastMessage("Broadcasting message");
                    this.broadcastEvent("Broadcasting event");
                }
            }
        })
        .ws('/' + this.serverConfig.messageBroadcastChannel, {

            idleTimeout: SocketServer.IDLE_TIMEOUT,
            maxBackpressure: SocketServer.MAX_BACKPRESSURE,
            maxPayloadLength: SocketServer.MAX_PAYLOAD_LENGTH,
            compression: uWS.SHARED_COMPRESSOR,

            open: (ws) => {
                console.log("client connected on message broadcast!");
                ws.subscribe(this.serverConfig.messageBroadcastChannel);
            }
        })
        .ws('/' + this.serverConfig.updatesChannel, {

            idleTimeout: SocketServer.IDLE_TIMEOUT,
            maxBackpressure: SocketServer.MAX_BACKPRESSURE,
            maxPayloadLength: SocketServer.MAX_PAYLOAD_LENGTH,
            compression: uWS.SHARED_COMPRESSOR,

            open: (ws) => {
                console.log("client connected on updates broadcast!");
                ws.subscribe(this.serverConfig.updatesChannel);
            }
        })
        .listen(3001, (token) => {
            if (token) {
                console.log('Socket server is istening on port ' + 3001);
            } else {
                console.log('Failed to listen on port ' + 3001);
            }
        });
    }

    public broadcastMessage(message: string): void {
        this.wsApp.publish(this.serverConfig.messageBroadcastChannel, message, false);
    }

    public broadcastEvent(event: string): void {
        this.wsApp.publish(this.serverConfig.updatesChannel, event, false);
    }
}

export default SocketServer