import axios from 'axios';
import { IGroupMember, IInterRepGroupV2 } from "./interfaces";
/**
 * Returns only the supported groups
 */
const getAllGroups = async (baseUrl: string): Promise<IInterRepGroupV2[]> => {
    try {
        const res = await axios({
            method: 'GET',
            timeout: 5000,
            url: baseUrl + "/groups",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        return res.data.data;
    } catch (e) {
        return []
    }
};

/**
 * Returns an ordered list of members in the group.
 */
const getMembersForGroup = async (baseUrl: string, provider: string, name: string, limit: number = 100, offset: number = 0): Promise<IGroupMember[]> => {
    try {
        const res = await axios({
            method: 'GET',
            timeout: 5000,
            url: baseUrl + `/groups/${provider}/${name}/members?limit=${limit}&offset=${offset}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        
        return res.data.data.map((el, index) => {
            return {
                index: offset + index,
                identityCommitment: el
            }
        });
    } catch (e) {
        console.log("Exception while loading members of the group: ", provider, name);
        return [];
    }
}

/**
 * Returns an ordered list of the leaf indexes of removed members in the group.
 */
const getRemovedMembersForGroup = async (baseUrl: string, provider: string, name: string, limit: number = 100, offset: number = 0): Promise<number[]> => {
    try {
        const res = await axios({
            method: 'GET',
            timeout: 5000,
            url: baseUrl + `/groups/${provider}/${name}/removed-members?limit=${limit}&offset=${offset}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        return res.data.data;
    } catch (e) {
        console.log("Exception while loading removed members of the group: ", provider, name);
        return [];
    }
}

const apiFunctions = {
    getAllGroups,
    getMembersForGroup,
    getRemovedMembersForGroup
}

export default apiFunctions