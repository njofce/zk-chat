import { model } from "mongoose";
import GroupSchema from "./group.schema";
import { IGroupDocument, IGroupModel } from "./group.types";

const MODEL_NAME = "Group";

const Group: IGroupModel = model<IGroupDocument, IGroupModel>(
    MODEL_NAME,
    GroupSchema,
    "groups"
);

export default Group;
