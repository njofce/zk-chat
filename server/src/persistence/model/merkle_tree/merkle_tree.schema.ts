import { Schema } from "mongoose";
import {
    findByLevelAndIndex,
    findZeros,
    findRoot,
    getTotalNumberOfLeaves,
    getAllLeaves,
    findLeafByHash,
    findLeafByGroupIdAndHash,
    findLeafByGroupIdAndIndexInGroup
} from "./merkle_tree.statics";
import {
    IMerkleTreeNode,
    IMerkleTreeNodeDocument,
    IMerkleTreeNodeModel,
    IMerkleTreeZero,
    IMerkleTreeZeroModel,
    IMerkleTreeZeroDocument,

} from "./merkle_tree.types";

// Node
const MerkleTreeNodeSchemaFields: Record<keyof IMerkleTreeNode, any> = {
    key: {
        groupId: String,
        level: Number,
        indexInGroup: Number,
        index: Number
    },
    parent: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "MerkleTreeNode",
    },
    siblingHash: String,
    banned: {
        type: Boolean,
        required: false,
    },
    hash: String,
};

export const MerkleTreeNodeSchema = new Schema<
    IMerkleTreeNodeDocument,
    IMerkleTreeNodeModel
>(MerkleTreeNodeSchemaFields);

MerkleTreeNodeSchema.statics.findLeafByGroupIdAndIndexInGroup = findLeafByGroupIdAndIndexInGroup;
MerkleTreeNodeSchema.statics.findLeafByGroupIdAndHash = findLeafByGroupIdAndHash;
MerkleTreeNodeSchema.statics.findByLevelAndIndex = findByLevelAndIndex;
MerkleTreeNodeSchema.statics.findLeafByHash = findLeafByHash;
MerkleTreeNodeSchema.statics.findRoot = findRoot;
MerkleTreeNodeSchema.statics.getTotalNumberOfLeaves = getTotalNumberOfLeaves;
MerkleTreeNodeSchema.statics.getAllLeaves = getAllLeaves;

// Zeros
export const MerkleTreeZeroSchemaFields: Record<keyof IMerkleTreeZero, any> = {
    level: { type: Number, unique: true },
    hash: String,
};

export const MerkleTreeZeroSchema = new Schema<
    IMerkleTreeZeroDocument,
    IMerkleTreeZeroModel
>(MerkleTreeZeroSchemaFields);

MerkleTreeZeroSchema.statics.findZeros = findZeros;
