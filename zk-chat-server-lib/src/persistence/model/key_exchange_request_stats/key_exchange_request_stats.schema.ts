import { Schema } from "mongoose";
import {
    isDuplicateRequest,
    isSpamRequest,
    getSharesForEpochForUser,
} from "./key_exchange_request_stats.statics";
import {
    IKeyExchangeRequestStats,
    IKeyExchangeRequestStatsModel,
    IKeyExchangeRequestStatsDocument,
} from "./key_exchange_request_stats.types";

const KeyExchangeRequestStatsSchemaField: Record<keyof IKeyExchangeRequestStats, any> = {
    nullifier: String,
    epoch: String,
    xShare: String,
    yShare: String
};

const KeyExchangeRequestStatsSchema = new Schema<
    IKeyExchangeRequestStatsDocument,
    IKeyExchangeRequestStatsModel
    >(KeyExchangeRequestStatsSchemaField);

KeyExchangeRequestStatsSchema.statics.isDuplicateRequest = isDuplicateRequest;
KeyExchangeRequestStatsSchema.statics.isSpamRequest = isSpamRequest;
KeyExchangeRequestStatsSchema.statics.getSharesForEpochForUser = getSharesForEpochForUser;

export default KeyExchangeRequestStatsSchema;
