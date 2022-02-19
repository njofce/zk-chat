import { bigintToHex } from 'bigint-conversion';
import { MerkleTreeNode, MerkleTreeZero } from './../persistence/model/merkle_tree/merkle_tree.model';
import { IGroupMember } from "../interrep/interfaces";
import BannedUser from "../persistence/model/banned_user/banned_user.model";
import { IBannedUser } from "../persistence/model/banned_user/banned_user.types";
import config from '../config';
import { IMerkleTreeNode, IMerkleTreeNodeDocument } from '../persistence/model/merkle_tree/merkle_tree.types';
import Hasher from '../util/hasher';

/**
 * Encapsulates the core functionality for managing user credentials as well as viewing the banned users.
 */
class UserService {

    private hasher: Hasher;

    constructor() {
        this.hasher = new Hasher();
    }

    public async getAllBannedUsers(): Promise<IBannedUser[]> {
        return await BannedUser.getAllBannedUsers();
    }

    public async countBanned(): Promise<number> {
        return await BannedUser.getTotalBannedUsers();
    }

    public async getRoot(): Promise<string> {
        const root: IMerkleTreeNode | null = await MerkleTreeNode.findRoot();

        if (root) {
            return root.hash;
        }

        throw "Root not found";
    }

    public async getLeaves(): Promise<string[]> {
        const allLeaves: string[] = (await MerkleTreeNode.getAllLeaves()).map(x => x.hash);

        return allLeaves.map(x => bigintToHex(BigInt(x)));
    }

    public async getPath(idCommitment: string): Promise<any> {

        const leafNode = await MerkleTreeNode.findLeafByHash(idCommitment);

        if (!leafNode) {
            throw "The identity commitment does not exist";
        }

        const allLeaves: string[] = (await MerkleTreeNode.getAllLeaves()).map(x => x.hash);

        return this.hasher.generateMerkleProof(allLeaves, leafNode.hash);
    }

    public async appendUsers(users: IGroupMember[], groupId: string): Promise<string> {
        
        if (users.length == 0)
            return "";

        // Get the zero hashes.
        const zeros = await MerkleTreeZero.findZeros();

        if (!zeros || zeros.length === 0) {
            throw `The zero hashes have not yet been created`;
        }

        console.log ("Analyzing group with ID and users", groupId, users.length);
        for (const user of users) {
            // No need to do anything if the user was previously added to the tree
            // A user's index is unique within a group, and we use that property to check whether the user was added
            // to the database previously, even though it's identitiy commitment can be set to zero if the user gets banned.
            const foundUser: IMerkleTreeNode | null = await MerkleTreeNode.findLeafByGroupIdAndIndexInGroup(groupId, user.index);
            if (foundUser) {
                console.log("User for the given group and index in group exists ", foundUser.hash);
                break;
            }

            // User doesn't exist, create and update tree
            let currentIndex = await MerkleTreeNode.getTotalNumberOfLeaves();

            if (currentIndex >= 2 ** config.MERKLE_TREE_LEVELS) {
                throw "The tree is full";
            }

            let currentNode: any = await MerkleTreeNode.create({
                key: {
                    index: currentIndex,
                    groupId: groupId,
                    level: 0,
                    indexInGroup: user.index
                },
                hash: user.identityCommitment
            })

            for (let level = 0; level < config.MERKLE_TREE_LEVELS; level++) {
                if (currentIndex % 2 === 0) {
                    
                    currentNode.siblingHash = zeros[level].hash;

                    let parentNode = await MerkleTreeNode.findByLevelAndIndex(level + 1, Math.floor(currentIndex / 2));

                    if (parentNode) {
                        parentNode.hash = this.hasher.poseidonHash([
                            BigInt(currentNode.hash),
                            BigInt(currentNode.siblingHash),
                        ]).toString();

                        await parentNode.save();
                    } else {
                        parentNode = await MerkleTreeNode.create({
                            key: {
                                groupId,
                                level: level + 1,
                                index: Math.floor(currentIndex / 2),
                                indexInGroup: -1
                            },
                            hash: this.hasher.poseidonHash([BigInt(currentNode.hash), BigInt(currentNode.siblingHash)]),
                        });
                    }

                    currentNode.parent = parentNode;
                    await currentNode.save();
                    currentNode = parentNode;
                } else {
                    const siblingNode = (await MerkleTreeNode.findByLevelAndIndex(level, currentIndex - 1)) as IMerkleTreeNodeDocument;
                    
                    currentNode.siblingHash = siblingNode.hash;
                    siblingNode.siblingHash = currentNode.hash;

                    const parentNode = (await MerkleTreeNode.findByLevelAndIndex(
                        level + 1,
                        Math.floor(currentIndex / 2))) as IMerkleTreeNodeDocument;

                    parentNode.hash = this.hasher.poseidonHash([
                        BigInt(siblingNode.hash),
                        BigInt(currentNode.hash),
                    ]).toString();

                    currentNode.parent = parentNode;

                    await currentNode.save();
                    await parentNode.save();
                    await siblingNode.save();

                    currentNode = parentNode;
                }

                currentIndex = Math.floor(currentIndex / 2);
            }

        }

        console.log("Synced members!");
        return "Done";
    }

    public async updateUser(leafHash: string, newValue: string = config.ZERO_VALUE.toString()) {
        let node = await MerkleTreeNode.findLeafByHash(leafHash);

        if (!node) {
            throw `The user with identity commitment ${leafHash} doesn't exists`;
        }

        node.hash = newValue;
        await node.save();

        while (node && node.parent) {
            const nodeIndex = node.key.index;
            const siblingHash = BigInt(node.siblingHash as string);
            const nodeHash = BigInt(node.hash);

            const parent = await MerkleTreeNode.findByLevelAndIndex(node.key.level + 1, Math.floor(nodeIndex / 2));

            const childrenHashes = nodeIndex % 2 === 0 ? [nodeHash, siblingHash] : [siblingHash, nodeHash];
            parent.hash = this.hasher.poseidonHash(childrenHashes).toString();

            await parent.save();
            node = parent;
        }

    }

    public async removeUser(idCommitment: string, secret: bigint): Promise<string> {
        const treeNode = await MerkleTreeNode.findLeafByHash(idCommitment);

        if (!treeNode) {
            throw "The user doesn't exists";
        }

        const bannedUser = new BannedUser({
            idCommitment,
            leafIndex: treeNode.key.index,
            secret: secret.toString(),
        });
        await bannedUser.save();
        return idCommitment
    }
}

export default UserService