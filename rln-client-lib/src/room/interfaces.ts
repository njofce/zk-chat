export interface IChatRoom {
    id: string;
    name: string;
    type: string;
}

export interface IPublicRoom extends IChatRoom{
    symmetric_key: string;
}

export interface IPrivateRoom extends IChatRoom {
    symmetric_key: string;
}

export interface IDirectRoom extends IChatRoom {
    recepient_public_key: string;
}
