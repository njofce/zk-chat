import {
    MerkleTreeNode,
    MerkleTreeZero,
} from "./merkle_tree.model";
import {
    IMerkleTreeNodeDocument,
    IMerkleTreeZeroDocument,
} from "./merkle_tree.types";

export async function findByLevelAndIndex(
    this: typeof MerkleTreeNode,
    level: number,
    index: number
): Promise<IMerkleTreeNodeDocument | null> {
    return this.findOne({ "key.level": level, "key.index": index }).populate("parent");
}

export async function findLeafByGroupIdAndHash(
    this: typeof MerkleTreeNode,
    groupId: string, 
    hash: string
): Promise<IMerkleTreeNodeDocument | null> {
    return this.findOne({ "key.level": 0, "key.groupId": groupId, hash }).populate("parent");
}

export async function findLeafByGroupIdAndIndexInGroup(
    this: typeof MerkleTreeNode,
    groupId: string,
    indexInGroup: number
): Promise<IMerkleTreeNodeDocument | null> {
    return this.findOne({ "key.level": 0, "key.indexInGroup": indexInGroup, "key.groupId": groupId });
}

export async function findLeafByHash(
    this: typeof MerkleTreeNode,
    hash: string
): Promise<IMerkleTreeNodeDocument | null> {
    return this.findOne({ "key.level": 0, hash }).populate("parent");
}

export async function getAllLeaves(this: typeof MerkleTreeNode): Promise<IMerkleTreeNodeDocument[]> {
    return this.find({ "key.level": 0 }).populate("parent");
}

export async function findRoot(
    this: typeof MerkleTreeNode
): Promise<IMerkleTreeNodeDocument | null> {
    return this.findOne({ parent: {$exists: false} });
}

export async function getTotalNumberOfLeaves(
    this: typeof MerkleTreeNode,
): Promise<number> {
    return this.countDocuments({ "key.level": 0 });
}

export async function findZeros(
    this: typeof MerkleTreeZero
): Promise<IMerkleTreeZeroDocument[]> {
    return this.find();
}

