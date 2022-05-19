import { model } from "mongoose";
import KeyExchangeBundleSchema from "./key_exchange_bundle.schema";
import { IKeyExchangeBundleDocument, IKeyExchangeBundleModel } from "./key_exchange_bundle.types";

const MODEL_NAME = "KeyExchangeBundle";

const KeyExchangeBundle: IKeyExchangeBundleModel = model<
    IKeyExchangeBundleDocument,
    IKeyExchangeBundleModel
    >(MODEL_NAME, KeyExchangeBundleSchema, "keyExchangeBundles");

export default KeyExchangeBundle;
