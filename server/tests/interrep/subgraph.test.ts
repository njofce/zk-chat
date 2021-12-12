import axios, { AxiosStatic } from 'axios'
import subgraphFunctions from './../../src/interrep/subgraph';
import { IGroupMember, IInterRepGroup } from './../../src/interrep/interfaces';
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
        const testGroups: IInterRepGroup[] = [
            {
                id: "1",
                provider: "github",
                name: "GOLD",
                size: 1
            },
            {
                id: "1",
                provider: "github",
                name: "GOLD",
                size: 1
            },
            {
                id: "1",
                provider: "github",
                name: "GOLD",
                size: 1
            }
        ];

        mockAxios.mockResolvedValue({ 
            data: {
                data: {
                    groups: testGroups 
                } 
            } 
        });

        const groups: any[] = await subgraphFunctions.getAllGroups();
        expect(groups.length).toEqual(3);
        expect(groups).toEqual(testGroups);
    });

    test('test get members of group - defaults', async () => {
        const testMembers_g1: IGroupMember[] = [...Array(6).keys()].map(x => {
            return {
                index: x,
                identityCommitment: "id-" + x
            }
        });

        mockAxios.mockResolvedValue({
            data: {
                data: {
                    group : {
                        members: testMembers_g1
                    }
                }
            }
        });

        const members: IGroupMember[] = await subgraphFunctions.getMembersForGroup("id1");
        expect(members.length).toEqual(6);
        expect(members).toEqual(testMembers_g1);
    });

});