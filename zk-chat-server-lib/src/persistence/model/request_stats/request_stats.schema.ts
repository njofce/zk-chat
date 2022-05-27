import { Schema } from "mongoose";
import {
    isDuplicateRequest,
    isSpamRequest,
    getSharesForEpochForUser,
} from "./request_stats.statics";
import {
    IRequestStats,
    IRequestStatsModel,
    IRequestStatsDocument,
} from "./request_stats.types";

const RequestStatsSchemaField: Record<keyof IRequestStats, any> = {
    nullifier: String,
    epoch: String,
    xShare: String,
    yShare: String
};

const RequestStatsSchema = new Schema<
    IRequestStatsDocument,
    IRequestStatsModel
>(RequestStatsSchemaField);

RequestStatsSchema.statics.isDuplicateRequest = isDuplicateRequest;
RequestStatsSchema.statics.isSpamRequest = isSpamRequest;
RequestStatsSchema.statics.getSharesForEpochForUser = getSharesForEpochForUser;

export default RequestStatsSchema;
