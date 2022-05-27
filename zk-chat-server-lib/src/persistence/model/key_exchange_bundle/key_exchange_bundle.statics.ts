import KeyExchangeBundle from "./key_exchange_bundle.model";
import { IKeyExchangeBundle } from "./key_exchange_bundle.types";

export async function getKeyExchangeBundlesByReceiverPublicKey(this: typeof KeyExchangeBundle, key: string): Promise<IKeyExchangeBundle[]> {
    return this.find({receiver_public_key: key});
}

export async function deleteKeyExchangeBundles(this: typeof KeyExchangeBundle, content_hash: string, receiver_public_key: string): Promise<number> {
    const res = await this.remove({content_hash: content_hash, receiver_public_key: receiver_public_key});
    return res.deletedCount;
}