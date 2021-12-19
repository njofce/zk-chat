export interface IChatRoom {
    id: string;
    name: string;
    type: string;
    symmetric_key: string;
}

export interface IPublicRoom extends IChatRoom{}

export interface IPrivateRoom extends IChatRoom {}

export interface IDirectRoom extends IChatRoom {
    recipient_public_key: string;
}
