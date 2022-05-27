export interface SocketClient {
    waitForConnections: () => void;
    sendMessage: (message: string) => Promise<string>;
    receiveMessage: (callback: (message: string) => void) => void;
    receiveEvent: (callback: (event: string) => void) => void;
}