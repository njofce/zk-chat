import { IPrivateRoom, IPublicRoom, IDirectRoom } from '../room/interfaces';

export interface IProfile {
    rln_identity_commitment: string;
    rln_identity_secret: string[];
    root_hash: string;
    auth_path: string; // Serialized path
    user_private_key: string;
    user_public_key: string;
    rooms: IRooms;
}

export interface IRooms {
    public: IPublicRoom[];
    private: IPrivateRoom[];
    direct: IDirectRoom[];
}