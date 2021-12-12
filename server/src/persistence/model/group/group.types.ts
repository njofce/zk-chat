import { Model, Document } from "mongoose";
import { getAllGroups, updateGroupSize } from "./group.statics";

export interface IGroup {
    group_id: string;
    provider: string;
    name: string;
    size: number;
}

export interface IGroupDocument extends IGroup, Document { }

export interface IGroupModel extends Model<IGroupDocument> {
    getAllGroups: typeof getAllGroups;
    updateGroupSize: typeof updateGroupSize;
}
