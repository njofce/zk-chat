import { clearDatabase } from '../jest.setup';
import { test, expect, describe, afterEach } from '@jest/globals'
import BannedUser from "../../src/persistence/model/banned_user/banned_user.model";
import { IBannedUser } from "../../src/persistence/model/banned_user/banned_user.types";
import UserService from '../../src/services/user.service';
import config from "../../src/config"
import { MerkleTreeNode, MerkleTreeZero } from '../../src/persistence/model/merkle_tree/merkle_tree.model';
import Hasher from '../../src/util/hasher';

describe('Test banned user service', () => {

    afterEach(async () => {
        await clearDatabase();
    })

    test('get banned users', async () => {
        const user_service = new UserService();

        // Insert 5 users
        for (let i = 0; i < 5; i++) {
            await insertBannedUser(i);
        }
        
        const allBannedUsers: IBannedUser[] = await user_service.getAllBannedUsers();
        const total: number = await user_service.countBanned();

        expect(allBannedUsers.length).toEqual(5);
        expect(total).toEqual(5);
    });

    test('get root - exists', async () => {
        const root = await MerkleTreeNode.create({
            key: {
                groupId: "group1",
                level: 1,
                index: 0,
                indexInGroup: -1
            },
            hash: "some hash",
        });

        await MerkleTreeNode.create({
            key: {
                groupId: "group1",
                level: 0,
                index: 0,
                indexInGroup: 0
            },
            hash: "some hash 2",
            parent: root
        });
        const user_service = new UserService();
        const rootHash = await user_service.getRoot();

        expect(rootHash).toEqual("some hash");
    });

    test('get root - not exists', async () => {
        const user_service = new UserService();
        try {
            await user_service.getRoot();
            expect(false).toBeTruthy();
        } catch (e) {
            expect(e).toContain("Root not found");
        }
    });

    test('get path - exists', async () => {
        const user_service = new UserService();
        await testSeedZeros(BigInt(0));

        await user_service.appendUsers([{
            index: 1,
            identityCommitment: BigInt(2 ^ 244).toString()
        }], "id-1");

        const path = await user_service.getPath(BigInt(2 ^ 244).toString());
        expect(path).toEqual({
            indices: [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ],
            pathElements: [
                "0",
                "120",
                "360",
                "840",
                "1800",
                "3720",
                "7560",
                "15240",
                "30600",
                "61320",
                "122760",
                "245640",
                "491400",
                "982920",
                "1965960",
           ],
           root: "3932286"
        });
    });

    test('get path - not exists', async () => {
        const user_service = new UserService();
        try {
            await user_service.getPath("non-existent-id-commitment");
            expect(false).toBeTruthy();
        } catch (e) {
            expect(e).toContain("The identity commitment does not exist");
        }
    });

    test('append users - no zeros', async () => {
        const user_service = new UserService();
        try {
            await user_service.appendUsers([{
                index: 1,
                identityCommitment: "Test ID commitment"
            }], "id-1");
            expect(false).toBeTruthy();
        } catch (e) {
            expect(e).toEqual("The zero hashes have not yet been created");
        }
    });

    test('append users - with zeros, empty', async () => {
        const user_service = new UserService();
        await testSeedZeros(BigInt(0));

        const result = await user_service.appendUsers([{
            index: 1,
            identityCommitment: BigInt(2 ^ 244).toString()
        }], "id-1");

        expect(result).toEqual("Done");

        const allNodes = await MerkleTreeNode.find({});
        expect(allNodes.length).toEqual(16);
    });

    test('append users - with zeros, user exists', async () => {
        const user_service = new UserService();
        await testSeedZeros(BigInt(0));

        const result1 = await user_service.appendUsers([{
            index: 1,
            identityCommitment: BigInt(2 ^ 244).toString()
        }], "id-1");

        expect(result1).toEqual("Done");

        let allNodes = await MerkleTreeNode.find({});
        expect(allNodes.length).toEqual(16);

        const result2 = await user_service.appendUsers([{
            index: 2,
            identityCommitment: BigInt(3 ^ 244).toString()
        }], "id-2");

        expect(result2).toEqual("Done");

        allNodes = await MerkleTreeNode.find({});
        expect(allNodes.length).toEqual(17);

        const result3 = await user_service.appendUsers([{
            index: 1,
            identityCommitment: BigInt(2 ^ 244).toString()
        }], "id-1");

        expect(result3).toEqual("Done");

        allNodes = await MerkleTreeNode.find({});
        expect(allNodes.length).toEqual(17); // user exists, was not added
    });

    test('remove user - exists', async () => {
        const user_service = new UserService();
        await testSeedZeros(BigInt(0));

        const result1 = await user_service.appendUsers([{
            index: 1,
            identityCommitment: BigInt(2 ^ 244).toString()
        }], "id-1");

        expect(result1).toEqual("Done");

        let allNodes = await MerkleTreeNode.find({});
        expect(allNodes.length).toEqual(16);

        const result2 = await user_service.appendUsers([{
            index: 2,
            identityCommitment: BigInt(3 ^ 244).toString()
        }], "id-2");

        expect(result2).toEqual("Done");

        await user_service.removeUser(BigInt(2 ^ 244).toString(), BigInt(13^120));

        const allBannedUsers: IBannedUser[] = await user_service.getAllBannedUsers();
        expect(allBannedUsers.length).toEqual(1);
    });

    test('remove user - not exists', async () => {
        const user_service = new UserService();
        try {
            await user_service.removeUser(BigInt(2 ^ 244).toString(), BigInt(11111));
            expect(false).toBeTruthy();
        } catch(e) {
            expect(e).toEqual("The user doesn't exists");
        }
    });

    test('update user - exists', async () => {
        const user_service = new UserService();
        await testSeedZeros(BigInt(0));

        const hash = BigInt(2 ^ 244).toString();

        const result1 = await user_service.appendUsers([{
            index: 1,
            identityCommitment: hash
        }], "id-1");

        expect(result1).toEqual("Done");

        let allNodes = await MerkleTreeNode.find({});
        expect(allNodes.length).toEqual(16);

        const result2 = await user_service.appendUsers([{
            index: 2,
            identityCommitment: BigInt(3 ^ 244).toString()
        }], "id-2");

        expect(result2).toEqual("Done");

        await user_service.updateUser(hash);

        let updatedUser = await MerkleTreeNode.findLeafByHash(hash);
        expect(updatedUser).toBeNull();
    });

    test('update user - not exists', async () => {
        const user_service = new UserService();
        const hash = BigInt(2 ^ 244).toString();
        try {
            await user_service.updateUser(hash);
            expect(false).toBeTruthy();
        } catch(e) {
            expect(e).toEqual("The user with identity commitment " + hash + " doesn't exists")
        }
    });

});

const insertBannedUser = async (id: number) => {
    const bannedUser = new BannedUser();
    bannedUser.idCommitment = "test-commitment-" + id;
    bannedUser.leafIndex = id;
    bannedUser.secret = "some random secret " + id;
    await bannedUser.save();
}

const testSeedZeros = async (zeroValue: BigInt) => {
    const hasher = new Hasher();
    const zeroHashes = await MerkleTreeZero.findZeros();

    if (!zeroHashes || zeroHashes.length === 0) {
        for (let level = 0; level < config.MERKLE_TREE_LEVELS; level++) {
            zeroValue =
                level === 0 ? zeroValue : hasher.poseidonHash([zeroValue, zeroValue]);

            const zeroHashDocument = await MerkleTreeZero.create({
                level,
                hash: zeroValue.toString(),
            });

            await zeroHashDocument.save();
        }
    }
};