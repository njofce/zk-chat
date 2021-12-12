import { clearDatabase } from '../jest.setup';
import { test, expect, describe, afterEach } from '@jest/globals'
import GroupService from '../../src/services/group.service'
import Group from '../../src/persistence/model/group/group.model';

describe('Test group service', () => {

    afterEach(async () => {
        await clearDatabase();
    });

    test('create group', async () => {
        const groupService = new GroupService();

        await groupService.saveGroup('id-1', 'github', 'test_1', 10);

        const allGroups = await Group.find({});
        expect(allGroups.length).toEqual(1);
    });

    test('update size', async () => {
        const groupService = new GroupService();

        await groupService.saveGroup('id-1', 'github', 'test_1', 10);

        await groupService.updateSize('id-1', 15);

        const allGroups = await Group.find({});
        expect(allGroups.length).toEqual(1);
        expect(allGroups[0].size).toEqual(15);
    });

    test('contains group', async () => {
        const groupService = new GroupService();

        await groupService.saveGroup('id-1', 'github', 'test_1', 10);

        const containsGroup1 = await groupService.containsGroup("id-1");
        expect(containsGroup1).toBeTruthy();
        
        const containsGroup2 = await groupService.containsGroup("id-2");
        expect(containsGroup2).toBeFalsy();
    });

    test('get groups - empty', async () => {
        const groupService = new GroupService();

        const groups = await groupService.getGroups();
        expect(groups.length).toEqual(0);

        await groupService.saveGroup('id-1', 'github', 'test_1', 10);
        await groupService.saveGroup('id-2', 'github', 'test_2', 10);

        const groups2 = await groupService.getGroups();
        expect(groups2.length).toEqual(2);
    });

});
