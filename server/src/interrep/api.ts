import axios from 'axios';
import config from "../config";
import { IGroupMember, IInterRepGroupV2 } from "./interfaces";
/**
 * Returns only the supported groups
 */
const getAllGroups = async (): Promise<IInterRepGroupV2[]> => {
    try {
        const res = await axios({
            method: 'GET',
            timeout: 5000,
            url: config.INTERREP_V2 + "/groups",
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
const getMembersForGroup = async (groupHash: string, limit: number = 100, offset: number = 0): Promise<IGroupMember[]> => {
    try {
        const res = await axios({
            method: 'GET',
            timeout: 5000,
            url: config.INTERREP_V2 + `/trees/${groupHash}?limit=${limit}&offset=${offset}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        if (res.status != 200) {
            return [];
        }
        
        return res.data.data.map((el, index) => {
            return {
                index: offset + index,
                identityCommitment: el
            }
        });
    } catch (e) {
        console.log("Exception while loading group: ", groupHash);
        return [];
    }
}

const apiFunctions = {
    getAllGroups,
    getMembersForGroup
}

export default apiFunctions