import { Model, Document } from "mongoose";
import {
    findByLevelAndIndex,
    findZeros,
    findRoot,
    getTotalNumberOfLeaves,
    findLeafByGroupIdAndHash,
    findLeafByGroupIdAndIndexInGroup,
    findLeafByHash,
    getAuthPath
} from "./merkle_tree.statics";

export interface IMerkleTreeNodeKey {
    groupId: string; // GroupID + indexInGroup for idempotency
    level: number;
    indexInGroup: number;
    index: number; // Index in the actual tree
}

export interface IMerkleTreeNode {
    key: IMerkleTreeNodeKey;
    parent?: IMerkleTreeNode; // Root node has no parent.
    siblingHash?: string; // Root has no sibling.
    banned?: boolean; // Wether the user is banned or not, only present at level 0 nodes
    hash: string;
}

export interface IMerkleTreeNodeDocument extends IMerkleTreeNode, Document { }

export interface IMerkleTreeNodeModel extends Model<IMerkleTreeNodeDocument> {
    findLeafByHash: typeof findLeafByHash;
    findLeafByGroupIdAndHash: typeof findLeafByGroupIdAndHash;
    findLeafByGroupIdAndIndexInGroup: typeof findLeafByGroupIdAndIndexInGroup;
    findByLevelAndIndex: typeof findByLevelAndIndex;
    findRoot: typeof findRoot;
    getAuthPath: typeof getAuthPath;
    getTotalNumberOfLeaves: typeof getTotalNumberOfLeaves;
}

export interface IMerkleTreeZero {
    level: number;
    hash: string;
}

export interface IMerkleTreeZeroDocument extends IMerkleTreeZero, Document { }

export interface IMerkleTreeZeroModel extends Model<IMerkleTreeZeroDocument> {
    findZeros: typeof findZeros;
}