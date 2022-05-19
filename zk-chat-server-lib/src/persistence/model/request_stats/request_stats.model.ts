import { model } from "mongoose";
import ReqeustStatsSchema from "./request_stats.schema";
import {
    IRequestStatsDocument,
    IRequestStatsModel,
} from "./request_stats.types";

const MODEL_NAME = "RequestStats";

const RequestStats: IRequestStatsModel = model<
    IRequestStatsDocument,
    IRequestStatsModel
>(MODEL_NAME, ReqeustStatsSchema, "requestStats");

export default RequestStats;
