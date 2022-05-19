import { Model, Document } from "mongoose";
import { getAllBannedUsers, getTotalBannedUsers } from "./banned_user.statics"

export interface IBannedUser {
    idCommitment: string;
    leafIndex: number;
    secret: string;
}

export interface IBannedUserDocument extends IBannedUser, Document { }

export interface IBannedUserModel extends Model<IBannedUserDocument> {
    getTotalBannedUsers: typeof getTotalBannedUsers;
    getAllBannedUsers: typeof getAllBannedUsers;
}
