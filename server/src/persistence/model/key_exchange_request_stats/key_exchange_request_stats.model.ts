import { model } from "mongoose";
import KeyExchangeRequestStatsSchema from "./key_exchange_request_stats.schema";
import {
    IKeyExchangeRequestStatsDocument,
    IKeyExchangeRequestStatsModel,
} from "./key_exchange_request_stats.types";

const MODEL_NAME = "KeyExchangeRequestStats";

const KeyExchangeRequestStats: IKeyExchangeRequestStatsModel = model<
    IKeyExchangeRequestStatsDocument,
    IKeyExchangeRequestStatsModel
    >(MODEL_NAME, KeyExchangeRequestStatsSchema, "keyExchangeRequestStats");

export default KeyExchangeRequestStats;
