import { Schema } from "mongoose";
import { getAllBannedUsers, getTotalBannedUsers } from "./banned_user.statics"
import {
    IBannedUser,
    IBannedUserDocument,
    IBannedUserModel,
} from "./banned_user.types";

const BannedUserSchemaFields: Record<keyof IBannedUser, any> = {
    idCommitment: { type: String, required: true, unique: true },
    leafIndex: { type: Number, required: true, unique: true },
    secret: { type: String, required: true, unique: true },
};

const BannedUserSchema = new Schema<IBannedUserDocument, IBannedUserModel>(
    BannedUserSchemaFields
);

BannedUserSchema.statics.getTotalBannedUsers = getTotalBannedUsers;
BannedUserSchema.statics.getAllBannedUsers = getAllBannedUsers;

export default BannedUserSchema;
