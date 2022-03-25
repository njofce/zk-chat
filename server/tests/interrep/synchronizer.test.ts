import { clearDatabase } from '../jest.setup';
import { jest, test, expect, describe, afterEach, beforeAll } from '@jest/globals'
import TestPubSub from '../fixtures/pubsub.mock';
import PubSub from '../../src/communication/pub_sub';
import UserService from '../../src/services/user.service'
import GroupService from '../../src/services/group.service'
import { IGroupMember, IInterRepGroupV2 } from '../../src/interrep/interfaces';
import InterRepSynchronizer from '../../src/interrep/index'
import subgraphFunctions from '../../src/interrep/api';

const testGroups: IInterRepGroupV2[] = [
    {
        root: "1",
        provider: "github",
        name: "GOLD",
        size: 4, // 2 deleted members.
        numberOfLeaves: 6
    },
    {
        root: "2",
        provider: "twitter",
        name: "GOLD",
        size: 9, // 1 deleted member
        numberOfLeaves: 10
    },
    {
        root: "3",
        provider: "reddit",
        name: "GOLD",
        size: 45, // 5 deleted members
        numberOfLeaves: 50
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

const getMembersForGroupMock = async (provider: string, name: string): Promise<IGroupMember[]> => {
    // Init deleted members
    testMembers_g1[1].identityCommitment = "0";
    testMembers_g1[2].identityCommitment = "0";

    testMembers_g2[5].identityCommitment = "0";

    testMembers_g3[0].identityCommitment = "0";
    testMembers_g3[20].identityCommitment = "0";
    testMembers_g3[21].identityCommitment = "0";
    testMembers_g3[30].identityCommitment = "0";
    testMembers_g3[45].identityCommitment = "0";
    
    if (provider == 'github' && name == 'GOLD')
        return testMembers_g1;
    else if (provider == 'twitter' && name == 'GOLD')
        return testMembers_g2;
    return testMembers_g3;
}

const getRemovedMembersForGroupMock = async (provider: string, name: string): Promise<number[]> => {
    if (provider == 'github' && name == 'GOLD')
        return [1, 2];
    else if (provider == 'twitter' && name == 'GOLD')
        return [5];
    return [0, 20, 21, 30, 45];
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
        subgraphFunctions.getRemovedMembersForGroup = getRemovedMembersForGroupMock;

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
                size: 1,
                number_of_leaves: 1
            }
        });

        let appendUsersSpy = jest.spyOn(UserService.prototype, 'appendUsers');
        appendUsersSpy.mockResolvedValue("success");

        await synchronizer.syncCommitmentsFromInterRep();

        expect(getGroupsSpy).toHaveBeenCalled();
        expect(saveGroupSpy).toHaveBeenCalledTimes(3);
        expect(appendUsersSpy).toHaveBeenCalledTimes(3);
    });

    test('test sync - full db', async () => {
        let getGroupsSpy = jest.spyOn(groupService, 'getGroups').mockResolvedValue([
                {
                    group_id: "github_GOLD",
                    provider: "github",
                    name: "GOLD",
                    size: 4,
                    number_of_leaves: 6
                },
                {
                    group_id: "twitter_GOLD",
                    provider: "twitter",
                    name: "GOLD",
                    size: 9,
                    number_of_leaves: 10
                },
                {
                    group_id: "reddit_GOLD",
                    provider: "reddit",
                    name: "GOLD",
                    size: 45,
                    number_of_leaves: 50
                }
            ]);
        let saveGroupSpy = jest.spyOn(groupService, 'saveGroup').mockResolvedValue({
                group_id: 'test',
                provider: 'test',
                name: 'test',
                size: 1,
                number_of_leaves: 1
            });

        let updateSizeSpy = jest.spyOn(groupService, 'updateSize').mockResolvedValue({
                group_id: 'test',
                provider: 'test',
                name: 'test',
                size: 1,
                number_of_leaves: 1
            });

        let appendUsersSpy = jest.spyOn(userService, 'appendUsers').mockResolvedValue("success");

        await synchronizer.syncCommitmentsFromInterRep();

        expect(getGroupsSpy).toHaveBeenCalled();
        expect(saveGroupSpy).not.toHaveBeenCalled();
        expect(updateSizeSpy).not.toHaveBeenCalled();
        expect(appendUsersSpy).not.toHaveBeenCalled();
    });

    test('test sync - partial db no deleted records', async () => {
        let getGroupsSpy = jest.spyOn(groupService, 'getGroups').mockResolvedValue(
            [
                {
                    group_id: "github_GOLD",
                    provider: "github",
                    name: "GOLD",
                    size: 4,
                    number_of_leaves: 6
                },
                {
                    group_id: "twitter_GOLD",
                    provider: "twitter",
                    name: "GOLD",
                    size: 9, // Same as db
                    number_of_leaves: 8 // Less records in db
                }
            ]);

        let saveGroupSpy = jest.spyOn(groupService, 'saveGroup').mockResolvedValue({
                group_id: 'test',
                provider: 'test',
                name: 'test',
                size: 1,
                number_of_leaves: 1
            });

        let updateSizeSpy = jest.spyOn(groupService, 'updateNumberOfLeaves').mockResolvedValue({
                group_id: 'test',
                provider: 'test',
                name: 'test',
                size: 1,
                number_of_leaves: 1
            });

        let appendUsersSpy = jest.spyOn(userService, 'appendUsers').mockResolvedValue("success");

        await synchronizer.syncCommitmentsFromInterRep();

        expect(getGroupsSpy).toHaveBeenCalled();
        expect(saveGroupSpy).toHaveBeenCalledTimes(1);
        expect(updateSizeSpy).toHaveBeenCalledTimes(1);
        expect(appendUsersSpy).toHaveBeenCalledTimes(2);
    });

    test('test sync - partial db with deleted records', async () => {
        let getGroupsSpy = jest.spyOn(groupService, 'getGroups').mockResolvedValue(
            [
                {
                    group_id: "github_GOLD",
                    provider: "github",
                    name: "GOLD",
                    size: 4,
                    number_of_leaves: 6
                },
                {
                    group_id: "twitter_GOLD",
                    provider: "twitter",
                    name: "GOLD",
                    size: 8, // Less records in db, some member was deleted
                    number_of_leaves: 10 // Same as db
                },
                {
                    group_id: "reddit_GOLD",
                    provider: "reddit",
                    name: "GOLD",
                    size: 45,
                    number_of_leaves: 50
                }
            ]);

        let saveGroupSpy = jest.spyOn(groupService, 'saveGroup').mockResolvedValue({
            group_id: 'test',
            provider: 'test',
            name: 'test',
            size: 1,
            number_of_leaves: 1
        });

        let updateSizeSpy = jest.spyOn(groupService, 'updateSize').mockResolvedValue({
            group_id: 'test',
            provider: 'test',
            name: 'test',
            size: 1,
            number_of_leaves: 1
        });

        let removeUsersByIndexesSpy = jest.spyOn(userService, 'removeUsersByIndexes').mockResolvedValue("success");

        await synchronizer.syncCommitmentsFromInterRep();

        expect(saveGroupSpy).not.toHaveBeenCalled();
        expect(getGroupsSpy).toHaveBeenCalled();
        expect(updateSizeSpy).toHaveBeenCalledTimes(1);
        expect(removeUsersByIndexesSpy).toHaveBeenCalledTimes(1);
        expect(removeUsersByIndexesSpy).toHaveBeenCalledWith([5], 'twitter_GOLD');
    });

});