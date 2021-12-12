import axios from 'axios';
import config from "../config";
import { IInterRepGroup, IGroupMember } from "./interfaces";

export const SUPPORTED_PROVIDERS: string = `[
    "reddit",
    "twitter",
    "github"
]`;

export const SUPPORTED_GROUP_NAMES: string = `[
    "NOT_SUFFICIENT",
    "SILVER",
    "BRONZE",
    "GOLD"
]`;

/**
 * Returns only the supported groups
 */
const getAllGroups = async (): Promise<IInterRepGroup[]> => {
    try {
        const res = await axios({
            method: 'POST',
            url: config.INTERREP_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            data: {
                query: `{
                    groups(where: { provider_in: ${SUPPORTED_PROVIDERS}, name_in: ${SUPPORTED_GROUP_NAMES} }) {
                        id
                        provider
                        name
                        size
                    }
                }` }
        }); 
        return res.data.data.groups;
    } catch (e) {
        return []
    }
};

/**
 * Returns an ordered list of members in the group.
 */
const getMembersForGroup = async (groupId: string, limit: number = 100, offset: number = 0): Promise<IGroupMember[]> => {
    try {
        const res = await axios({
            method: 'POST',
            url: config.INTERREP_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            data: {
                query: `{
                    group(id:"${groupId}") {
                        id
                        name
                        size
                        members(first: ${limit}, skip: ${offset}, orderBy:index, orderDirection:asc) {
                            index
                            identityCommitment
                        }
                    }
                }` }
        });
        return res.data.data.group.members;
    } catch (e) {
        console.log(e);
        return [];
    }
}

const subgraphFunctions = {
    getAllGroups,
    getMembersForGroup
}

export default subgraphFunctions