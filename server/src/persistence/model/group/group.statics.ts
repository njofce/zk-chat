import Group from "./group.model";
import { IGroup } from "./group.types";

export async function getAllGroups(this: typeof Group,): Promise<IGroup[]> {
    return this.find({});
}

export async function updateGroupSize(this: typeof Group, id: string, new_size: number): Promise<IGroup | null> {
    return this.findOneAndUpdate({group_id: id}, {size: new_size});
}

export async function updateGroupLeafCount(this: typeof Group, id: string, new_leaf_count: number): Promise<IGroup | null> {
    return this.findOneAndUpdate({ group_id: id }, { number_of_leaves: new_leaf_count });
}