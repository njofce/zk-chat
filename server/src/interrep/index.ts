import { IGroup } from "../persistence/model/group/group.types";
import UserService from "../services/user.service";
import GroupService from "../services/group.service";
import { IGroupMember, IInterRepGroup } from "./interfaces";
import PubSub from "../communication/pub_sub";
import { SyncType } from "../communication/socket/config";
import subgraphFunctions from "./subgraph";

/**
 * Synchronize the InterRep tree with the local database. 
 * 
 * The algorithms first retrieves all groups from InterRep,
 * without any pagination assuming the number of existing groups is lower than 100. After that, it tries to check
 * the status of each loaded group with the group stored in the database. For any group which doesn't exist in the
 * database, or the size of the group stored in the database is lower than the size of the retrieved group, 
 * the members are retrieved, using pagination, stored in the database, and the respective group is updated in the
 * database.
 */
class InterRepSynchronizer {

    private pubSub: PubSub;
    private groupService: GroupService;
    private userService: UserService;

    constructor(pubSub: PubSub, groupService: GroupService, userService: UserService) {
        this.pubSub = pubSub;
        this.groupService = groupService;
        this.userService = userService;
    }

    public sync = async() => {
        await this.syncCommitmentsFromInterRep();
        await this.subscribeToContractUpdates();
    }

    private syncCommitmentsFromInterRep = async() => {
        // On startup
        // 1. Get all groups from interrep
        const allGroupsOnNet: IInterRepGroup[] = await subgraphFunctions.getAllGroups();
        const groupsInDb: IGroup[] = await this.groupService.getGroups();
        console.log("Syncing");
        // 2. For each group, check the status in database. Only load new members for group if the size in db is different than the new size of the group
        for (let g of allGroupsOnNet) {
            const groupInDb: IGroup | undefined = groupsInDb.find(x => x.group_id == g.id);

            if (groupInDb == undefined) {
                // Group doesn't exist, load all members for that group, paginate over 100
                const groupMembers: IGroupMember[] = await this.loadGroupMembersWithPagination(g.id, 0, g.size);
                try {
                    // Add all members to the tree
                    await this.userService.appendUsers(groupMembers, g.id);
                    // Persist the group
                    await this.groupService.saveGroup(g.id, g.provider, g.name, g.size);
                } catch (e) {
                    console.log("Unknown error while saving group", e);
                }
            } else {
                // Group exists, load new members only if sizes differ (new members got added in InterRep)
                if (g.size > groupInDb.size) {
                    // Load members from groupInDb.size up to g.size
                    const groupMembers: IGroupMember[] = await this.loadGroupMembersWithPagination(g.id, groupInDb.size, g.size);
                    try {
                        // Add group members to the tree
                        await this.userService.appendUsers(groupMembers, g.id);
                        // Update group in DB
                        await this.groupService.updateSize(g.id, g.size);
                    } catch (e) {
                        console.log("Unknown error while saving group", e);
                    }
                }
            }
        }

        // A test user
        if (groupsInDb.findIndex(g => g.group_id == "local-test-group") == -1) {
            await this.userService.appendUsers([
                {
                    identityCommitment: "17653365708849444179865362482568296819146357340229089950066221313927057063266",
                    index: 0
                }], 
                "local-test-group");
            await this.groupService.saveGroup("local-test-group", "test", "test", 1);
        }


        this.publishEvent();
    }

    private async loadGroupMembersWithPagination(groupId: string, offset: number, to: number): Promise<IGroupMember[]> {
        let loadedMembers: IGroupMember[] = [];

        const limit: number = 100;

        let members: IGroupMember[] = await subgraphFunctions.getMembersForGroup(groupId, limit, offset);

        loadedMembers = loadedMembers.concat(members);

        while (members.length + limit <= to) {
            offset += limit;
            members = await subgraphFunctions.getMembersForGroup(groupId, limit, offset);
            loadedMembers = loadedMembers.concat(members);
        }

        return loadedMembers;
    }

    // TODO: Implement this by listening to Contract update events
    private subscribeToContractUpdates = async () => {
        
    }

    private publishEvent() {
        this.pubSub.publish({
            type: SyncType.EVENT,
            message: "TREE_UPDATE"
        })
    }
}

export default InterRepSynchronizer