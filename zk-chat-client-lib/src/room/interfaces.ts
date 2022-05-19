export interface IChatRoom {
    id: string;
    name: string;
    type: string;
    symmetric_key: string;
}

export interface IKeyExchangeEnabledRoom extends IChatRoom{
    dh_public_key: string;
    dh_private_key: string;
    recipient_public_key: string;
}

export interface IPublicRoom extends IChatRoom{}

export interface IPrivateRoom extends IChatRoom {}

/**
 * The symmetric key for the direct rooms will be the shared secret. By default it is none.
 */
export interface IDirectRoom extends IKeyExchangeEnabledRoom {}
