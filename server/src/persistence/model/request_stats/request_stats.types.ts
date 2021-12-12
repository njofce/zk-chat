import { Model, Document } from "mongoose";
import {
    isDuplicateRequest,
    isSpamRequest,
    getSharesForEpochForUser,
} from "./request_stats.statics";

export interface IShares {
    xShare: string;
    yShare: string;
}

export interface IRequestStats {
    nullifier: string;
    epoch: string;
    xShare: string;
    yShare: string;
}

export interface IRequestStatsDocument extends IRequestStats, Document { }

export interface IRequestStatsModel extends Model<IRequestStatsDocument> {
    isDuplicateRequest: typeof isDuplicateRequest;
    isSpamRequest: typeof isSpamRequest;
    getSharesForEpochForUser: typeof getSharesForEpochForUser;
}
