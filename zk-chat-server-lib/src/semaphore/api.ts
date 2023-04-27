import axios from 'axios';
import { IGroupMember, IInterRepGroupV2 } from "./interfaces";
import { Group } from "@semaphore-protocol/group";

const DEFAULT_DEPTH = 16
const DEFAULT_GROUP_ID = "1"

/**
 * Returns only the supported groups
 */
const getAllGroups = async (baseUrl: string): Promise<IInterRepGroupV2[]> => {
    const membersRaw = await getMembersForGroup(baseUrl);
    const members = membersRaw.map((member: IGroupMember) => member.identityCommitment);
    const group = new Group(DEFAULT_GROUP_ID, DEFAULT_DEPTH);
    group.addMembers(members);
    const merkleRoot = String(group.root);
    console.log("!@# getAllGroups: members.length=", members.length, ", merkleRoot=", merkleRoot);
    return [
        {
            root: merkleRoot,
            name: 'Zuzalu Participants',
            provider: "Semaphore",
            // NOTE: (Kevin) size and number of leaves are the same since
            // members should not be removed in Zuzalu?
            size: members.length,
            numberOfLeaves: members.length,
        },
    ]
};

/**
 * Returns an ordered list of members in the group.
 */
const getMembersForGroup = async (baseUrl: string): Promise<IGroupMember[]> => {
    const id = DEFAULT_GROUP_ID
    const url = baseUrl + `/semaphore/${id}`;
    console.log("!@# getMembersForGroup: url = ", url)
    try {
        const res = await axios({
            method: 'GET',
            timeout: 5000,
            url,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        const members: IGroupMember[] = res.data.members.map((member: string, index: number) => {
            return {
                index,
                identityCommitment: member
            }
        })
        return members;
    } catch (e) {
        console.log("Exception while loading members of the group: ", id);
        return [];
    }
}

/**
 * Returns an ordered list of the leaf indexes of removed members in the group.
 */
const getRemovedMembersForGroup = async (baseUrl: string): Promise<number[]> => {
    // NOTE: (Kevin) I don't think we need this function for Zuzalu
    return [];
}

const apiFunctions = {
    getAllGroups,
    getMembersForGroup,
    getRemovedMembersForGroup
}

export default apiFunctions