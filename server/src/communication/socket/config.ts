export interface ISocketServerConfig {
    port: number;
    messageChannel: string;
    messageBroadcastChannel: string;
    updatesChannel: string;
}

export enum SyncType {
    MESSAGE,
    EVENT
}

export interface ISyncMessage {
    type: SyncType;
    message: string;
}