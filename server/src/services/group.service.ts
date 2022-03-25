import Group from '../persistence/model/group/group.model';
import { IGroup } from '../persistence/model/group/group.types';

/**
 * Encapsulates the functionality for working with InterRep groups
 */
class GroupService {

    public async getGroups(): Promise<IGroup[]> {
        return await Group.getAllGroups();
    }

    public async saveGroup(group_id: string, provider: string, name: string, size: number, number_of_leaves: number): Promise<IGroup> {
        const group = await Group.create({
            group_id: group_id,
            provider: provider,
            name: name,
            size: size,
            number_of_leaves: number_of_leaves
        })
        return await group.save();
    }

    public async updateSize(group_id: string, new_size: number): Promise<IGroup | null> {
        return await Group.updateGroupSize(group_id, new_size);
    }

    public async updateNumberOfLeaves(group_id: string, new_number_of_leaves: number): Promise<IGroup | null> {
        return await Group.updateGroupLeafCount(group_id, new_number_of_leaves);
    }

    public async containsGroup(group_id: string): Promise<boolean> {
        const group = await Group.findOne({group_id: group_id})
        return group != null ? true : false;
    }

}

export default GroupService