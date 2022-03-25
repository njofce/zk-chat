import { IInterRepGroupV2 } from './../../dist/src/interrep/interfaces.d';
import axios, { AxiosStatic } from 'axios'
import apiFunctions from '../../src/interrep/api';
import { IGroupMember } from '../../src/interrep/interfaces';
import { clearDatabase } from '../jest.setup';
import { jest, test, expect, describe, afterEach } from '@jest/globals'

interface AxiosMock extends AxiosStatic {
    mockResolvedValue: Function
    mockRejectedValue: Function
}

jest.mock('axios')
const mockAxios = axios as AxiosMock

describe('Test interrep sync - subgraph', () => {

    afterEach(async () => {
        await clearDatabase();
    })

    test('test get all groups', async () => {
        const testGroups: IInterRepGroupV2[] = [
            {
                root: "1",
                provider: "github",
                name: "GOLD",
                size: 1,
                numberOfLeaves: 1
            },
            {
                root: "1",
                provider: "github",
                name: "GOLD",
                size: 1,
                numberOfLeaves: 1
            },
            {
                root: "1",
                provider: "github",
                name: "GOLD",
                size: 1,
                numberOfLeaves: 1
            }
        ];

        mockAxios.mockResolvedValue({ 
            data: {
                data: testGroups
            } 
        });

        const groups: any[] = await apiFunctions.getAllGroups();
        expect(groups.length).toEqual(3);
        expect(groups).toEqual(testGroups);
    });

    test('test get members of group - defaults', async () => {
        const testMembers_g1 = [...Array(6).keys()].map(x => {
            return "id-" + x
        });

        mockAxios.mockResolvedValue({
            data: {
                data: testMembers_g1
            }
        });

        const members: IGroupMember[] = await apiFunctions.getMembersForGroup("twitter", "not_sufficient");
        expect(members.length).toEqual(6);
        expect(members[0]).toEqual({ index: 0, identityCommitment: 'id-0' });
        expect(members[1]).toEqual({ index: 1, identityCommitment: 'id-1' });
        expect(members[5]).toEqual({ index: 5, identityCommitment: 'id-5' });
    });

    test('test get deleted members of group - defaults', async () => {
        const deletedIndexes = [0, 1, 2]

        mockAxios.mockResolvedValue({
            data: {
                data: deletedIndexes
            }
        });

        const removedIndexes: number[] = await apiFunctions.getRemovedMembersForGroup("twitter", "not_sufficient");
        expect(removedIndexes.length).toEqual(3);
        expect(removedIndexes[0]).toEqual(0);
        expect(removedIndexes[1]).toEqual(1);
        expect(removedIndexes[2]).toEqual(2);
    });

});