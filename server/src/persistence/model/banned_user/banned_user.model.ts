import { model } from "mongoose";
import BannedUserSchema from "./banned_user.schema";
import { IBannedUserDocument, IBannedUserModel } from "./banned_user.types";

const MODEL_NAME = "BannedUser";

const BannedUser: IBannedUserModel = model<
    IBannedUserDocument,
    IBannedUserModel
>(MODEL_NAME, BannedUserSchema, "bannedUsers");

export default BannedUser;
