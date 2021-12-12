import Group from '../persistence/model/group/group.model';
import { IGroup } from '../persistence/model/group/group.types';

class GroupService {

    public async getGroups(): Promise<IGroup[]> {
        return await Group.getAllGroups();
    }

    public async saveGroup(group_id: string, provider: string, name: string, size: number): Promise<IGroup> {
        const group = await Group.create({
            group_id: group_id,
            provider: provider,
            name: name,
            size: size
        })
        return await group.save();
    }

    public async updateSize(group_id: string, new_size: number): Promise<IGroup | null> {
        return await Group.updateGroupSize(group_id, new_size);
    }

    public async containsGroup(group_id: string): Promise<boolean> {
        const group = await Group.findOne({group_id: group_id})
        return group != null ? true : false;
    }

}

export default GroupService