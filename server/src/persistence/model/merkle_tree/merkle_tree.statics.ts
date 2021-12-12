import {
    MerkleTreeNode,
    MerkleTreeZero,
} from "./merkle_tree.model";
import {
    IMerkleTreeNodeDocument,
    IMerkleTreeNodeKey,
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

export async function getAuthPath(
    this: typeof MerkleTreeNode,
    key: IMerkleTreeNodeKey
): Promise<any> {
    const query = this.aggregate(
        [
            {
                $match: {
                    key,
                },
            },
            {
                $graphLookup: {
                    from: "treeNodes",
                    startWith: "$_id",
                    connectFromField: "parent",
                    connectToField: "_id",
                    as: "path",
                    depthField: "level",
                },
            },
            {
                $unwind: {
                    path: "$path",
                },
            },
            {
                $project: {
                    path: 1,
                    _id: 0,
                },
            },
            {
                $addFields: {
                    hash: "$path.hash",
                    sibling: "$path.siblingHash",
                    index: { $mod: ["$path.key.index", 2] },
                    level: "$path.level",
                },
            },
            {
                $sort: {
                    level: 1,
                },
            },
            {
                $project: {
                    path: 0,
                },
            },
        ]
    );

    return new Promise((resolve, reject) => {
        query.exec((error, path) => {
            if (error) {
                reject(error);
            }

            const root = path.pop().hash;
            const pathElements = path.map((n) => n.sibling);
            const indices = path.map((n) => n.index);

            resolve({ pathElements, indices, root });
        });
    });
}

export async function findZeros(
    this: typeof MerkleTreeZero
): Promise<IMerkleTreeZeroDocument[]> {
    return this.find();
}

