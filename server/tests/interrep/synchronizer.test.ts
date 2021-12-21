import { clearDatabase } from '../jest.setup';
import { jest, test, expect, describe, afterEach, beforeAll, afterAll } from '@jest/globals'
import TestPubSub from '../fixtures/pubsub.mock';
import PubSub from '../../src/communication/pub_sub';
import UserService from '../../src/services/user.service'
import GroupService from '../../src/services/group.service'
import { IGroupMember, IInterRepGroup, IInterRepGroupV2 } from '../../src/interrep/interfaces';
import InterRepSynchronizer from '../../src/interrep/index'
import subgraphFunctions from '../../src/interrep/api';

const testGroups: IInterRepGroupV2[] = [
    {
        rootHash: "1",
        provider: "github",
        name: "GOLD",
        size: 6
    },
    {
        rootHash: "2",
        provider: "twitter",
        name: "GOLD",
        size: 10
    },
    {
        rootHash: "3",
        provider: "reddit",
        name: "GOLD",
        size: 50
    }
];

const testMembers_g1: IGroupMember[] = [...Array(6).keys()].map(x => {
    return {
        index: x,
        identityCommitment: "g1-id-" + x
    }
});

const testMembers_g2: IGroupMember[] = [...Array(10).keys()].map(x => {
    return {
        index: x,
        identityCommitment: "g2-id-" + x
    }
});

const testMembers_g3: IGroupMember[] = [...Array(50).keys()].map(x => {
    return {
        index: x,
        identityCommitment: "g3-id-" + x
    }
});

const getAllGroupsMock = async (): Promise<IInterRepGroupV2[]> => {
    return testGroups
};

const getMembersForGroupMock = async (groupid: string): Promise<IGroupMember[]> => {
    if (groupid == '1')
        return testMembers_g1;
    else if (groupid == '2')
        return testMembers_g2;
    return testMembers_g3;
}

describe('Test interrep synchronizer', () => {

    let testPubSub: PubSub;
    let groupService: GroupService;
    let userService: UserService;

    let synchronizer: InterRepSynchronizer;

    beforeAll(async () => {
        testPubSub = new TestPubSub();
        groupService = new GroupService();
        userService = new UserService();

        subgraphFunctions.getAllGroups = getAllGroupsMock;
        subgraphFunctions.getMembersForGroup = getMembersForGroupMock;

        synchronizer = new InterRepSynchronizer(testPubSub, groupService, userService);
    })

    afterEach(async () => {
        await clearDatabase();
        jest.restoreAllMocks();
    })

    test('test sync - empty db', async () => {
        let getGroupsSpy = jest.spyOn(GroupService.prototype, 'getGroups');
        getGroupsSpy.mockResolvedValue([]);

        let saveGroupSpy = jest.spyOn(GroupService.prototype, 'saveGroup');
        saveGroupSpy.mockImplementation(async() => {
            return {
                group_id: 'test',
                provider: 'test',
                name: 'test',
                size: 1
            }
        });

        let appendUsersSpy = jest.spyOn(UserService.prototype, 'appendUsers');
        appendUsersSpy.mockResolvedValue("success");

        await synchronizer.syncCommitmentsFromInterRep();

        expect(getGroupsSpy).toHaveBeenCalled();
        expect(saveGroupSpy).toHaveBeenCalledTimes(3 + 1);
        expect(appendUsersSpy).toHaveBeenCalledTimes(3 + 1);
    });

    test('test sync - full db', async () => {
        let getGroupsSpy = jest.spyOn(groupService, 'getGroups').mockResolvedValue([
                {
                    group_id: "github_GOLD",
                    provider: "github",
                    name: "GOLD",
                    size: 6
                },
                {
                    group_id: "twitter_GOLD",
                    provider: "twitter",
                    name: "GOLD",
                    size: 10
                },
                {
                    group_id: "reddit_GOLD",
                    provider: "reddit",
                    name: "GOLD",
                    size: 50
                }
            ]);
        let saveGroupSpy = jest.spyOn(groupService, 'saveGroup').mockResolvedValue({
                group_id: 'test',
                provider: 'test',
                name: 'test',
                size: 1
            });

        let updateSizeSpy = jest.spyOn(groupService, 'updateSize').mockResolvedValue({
                group_id: 'test',
                provider: 'test',
                name: 'test',
                size: 1
            });

        let appendUsersSpy = jest.spyOn(userService, 'appendUsers').mockResolvedValue("success");

        await synchronizer.syncCommitmentsFromInterRep();

        expect(getGroupsSpy).toHaveBeenCalled();
        // expect(saveGroupSpy).not.toHaveBeenCalled();
        // expect(updateSizeSpy).not.toHaveBeenCalled();
        // expect(appendUsersSpy).not.toHaveBeenCalled();
    });

    test('test sync - partial db', async () => {
        let getGroupsSpy = jest.spyOn(groupService, 'getGroups').mockResolvedValue(
            [
                {
                    group_id: "github_GOLD",
                    provider: "github",
                    name: "GOLD",
                    size: 6
                },
                {
                    group_id: "twitter_GOLD",
                    provider: "twitter",
                    name: "GOLD",
                    size: 8 // Less records in db
                }
            ]);

        let saveGroupSpy = jest.spyOn(groupService, 'saveGroup').mockResolvedValue({
                group_id: 'test',
                provider: 'test',
                name: 'test',
                size: 1
            });

        let updateSizeSpy = jest.spyOn(groupService, 'updateSize').mockResolvedValue({
                group_id: 'test',
                provider: 'test',
                name: 'test',
                size: 1
            });

        let appendUsersSpy = jest.spyOn(userService, 'appendUsers').mockResolvedValue("success");

        await synchronizer.syncCommitmentsFromInterRep();

        expect(getGroupsSpy).toHaveBeenCalled();
        expect(saveGroupSpy).toHaveBeenCalledTimes(1 + 1);
        expect(updateSizeSpy).toHaveBeenCalledTimes(1);
        expect(appendUsersSpy).toHaveBeenCalledTimes(2 + 1);
    });

});