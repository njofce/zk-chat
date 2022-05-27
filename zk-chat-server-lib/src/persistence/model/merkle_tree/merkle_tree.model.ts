import { model, models } from "mongoose";
import {
    MerkleTreeNodeSchema,
    MerkleTreeZeroSchema,
} from "./merkle_tree.schema";
import {
    IMerkleTreeNodeDocument,
    IMerkleTreeNodeModel,
    IMerkleTreeZeroDocument,
    IMerkleTreeZeroModel,

} from "./merkle_tree.types";

const NODE_MODEL_NAME = "MerkleTreeNode";
const ZERO_MODEL_NAME = "MerkleTreeZero";

export const MerkleTreeNode: IMerkleTreeNodeModel =
    (models[NODE_MODEL_NAME] as IMerkleTreeNodeModel) ||
    model<IMerkleTreeNodeDocument, IMerkleTreeNodeModel>(
        NODE_MODEL_NAME,
        MerkleTreeNodeSchema,
        "treeNodes"
    );

export const MerkleTreeZero: IMerkleTreeZeroModel =
    (models[ZERO_MODEL_NAME] as IMerkleTreeZeroModel) ||
    model<IMerkleTreeZeroDocument, IMerkleTreeZeroModel>(
        ZERO_MODEL_NAME,
        MerkleTreeZeroSchema,
        "treeZeros"
    );
