import { IPrivateRoom, IPublicRoom, IDirectRoom } from '../room/interfaces';

export type IProfile = {
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

export type IRooms = {
    public: IPublicRoom[];
    private: IPrivateRoom[];
    direct: IDirectRoom[];
}

export type ITrustedContactsMap = {
    [name: string]: ITrustedContact;
}

export type ITrustedContact = {
    name: string;
    publicKey: string;
}