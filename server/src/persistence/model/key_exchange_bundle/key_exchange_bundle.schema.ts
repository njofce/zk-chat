import { Schema } from "mongoose";
import { getKeyExchangeBundlesByReceiverPublicKey, deleteKeyExchangeBundles } from "./key_exchange_bundle.statics"
import {
    IKeyExchangeBundle,
    IKeyExchangeBundleDocument,
    IKeyExchangeBundleModel,
} from "./key_exchange_bundle.types";

const KeyExchangeBundleSchemaFields: Record<keyof IKeyExchangeBundle, any> = {
    encrypted_content: { type: String, required: true, unique: true }, // saving the same content twice means the same user is posting the data for the same room twice, which should not be possible
    content_hash: { type: String, required: true, unique: true },
    encrypted_key: { type: String, required: true, unique: false },
    receiver_public_key: { type: String, required: true, unique: false }
};

const BannedUserSchema = new Schema<IKeyExchangeBundleDocument, IKeyExchangeBundleModel>(
    KeyExchangeBundleSchemaFields
);

BannedUserSchema.statics.getKeyExchangeBundlesByReceiverPublicKey = getKeyExchangeBundlesByReceiverPublicKey;
BannedUserSchema.statics.deleteKeyExchangeBundles = deleteKeyExchangeBundles;

export default BannedUserSchema;
