import { Model, Document } from "mongoose";
import {
    isDuplicateRequest,
    isSpamRequest,
    getSharesForEpochForUser,
} from "./key_exchange_request_stats.statics";

export interface IKeyExchangeRequestStats {
    nullifier: string;
    epoch: string;
    xShare: string;
    yShare: string;
}

export interface IKeyExchangeRequestStatsDocument extends IKeyExchangeRequestStats, Document { }

export interface IKeyExchangeRequestStatsModel extends Model<IKeyExchangeRequestStatsDocument> {
    isDuplicateRequest: typeof isDuplicateRequest;
    isSpamRequest: typeof isSpamRequest;
    getSharesForEpochForUser: typeof getSharesForEpochForUser;
}
