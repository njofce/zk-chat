import { IPrivateRoom, IPublicRoom, IDirectRoom } from '../room/interfaces';

export interface IProfile {
    rln_identity_commitment: string;
    root_hash: string;
    leaves: string[];
    user_private_key: string;
    user_public_key: string;
    rooms: IRooms;
    contacts: ITrustedContactsMap;
    username: string;
    user_id: number;
}

export interface IRooms {
    public: IPublicRoom[];
    private: IPrivateRoom[];
    direct: IDirectRoom[];
}

export interface ITrustedContactsMap {
    [name: string]: ITrustedContact;
}

export interface ITrustedContact {
    name: string;
    publicKey: string;
}