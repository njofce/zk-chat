import { Schema } from "mongoose";
import { getAllGroups, updateGroupSize } from "./group.statics";
import { IGroup, IGroupDocument, IGroupModel } from "./group.types";

const GroupSchemaField: Record<keyof IGroup, any> = {
    group_id: { type: String, required: true, unique: true },
    provider: { type: String, required: true, unique: false },
    name: { type: String, required: true, unique: false },
    size: { type: Number, required: true, unique: false }
};

const GroupSchema = new Schema<IGroupDocument, IGroupModel>(GroupSchemaField);
GroupSchema.statics.getAllGroups = getAllGroups;
GroupSchema.statics.updateGroupSize = updateGroupSize;

export default GroupSchema;
