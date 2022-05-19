import { Model, Document } from "mongoose";
import { getKeyExchangeBundlesByReceiverPublicKey, deleteKeyExchangeBundles } from "./key_exchange_bundle.statics"

export interface IKeyExchangeBundle {
    encrypted_content: string;
    content_hash: string;
    encrypted_key: string;
    receiver_public_key: string;
}

export interface IKeyExchangeBundleDocument extends IKeyExchangeBundle, Document { }

export interface IKeyExchangeBundleModel extends Model<IKeyExchangeBundleDocument> {
    getKeyExchangeBundlesByReceiverPublicKey: typeof getKeyExchangeBundlesByReceiverPublicKey;
    deleteKeyExchangeBundles: typeof deleteKeyExchangeBundles;
}
