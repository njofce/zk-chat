import BannedUser from "./banned_user.model";
import { IBannedUser } from "./banned_user.types";

export async function getTotalBannedUsers(this: typeof BannedUser,): Promise<number> {
    return this.countDocuments({});
}

export async function getAllBannedUsers(this: typeof BannedUser,): Promise<IBannedUser[]> {
    return this.find({}).limit(100);
}
