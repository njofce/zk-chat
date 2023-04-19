import { RLNFullProof } from "rlnjs";

import { generateRLNProof } from "./request-passport-client";


type IStorageArtifacts = {
    leaves: string[],
    depth: number,
    leavesPerNode: number,
};

type IFuncGenerateProof = (
    // TODO: change `string` to `bigint`
    epoch: string,
    signal: string,
    storage_artifacts: IStorageArtifacts,
    rln_identitifer: string,
) => Promise<RLNFullProof>;
/**
 * A callback function to generate RLN proof using the ZK-keeper plugin.
 */
export const generateProof: IFuncGenerateProof = async(
    epoch: string,
    signal: string,
    storage_artifacts: IStorageArtifacts,
    rln_identitifer: string,
): Promise<RLNFullProof> => {
    const pcd = await generateRLNProof(
        BigInt(epoch),
        signal,
        BigInt(rln_identitifer),
        false,
    )
    if (!pcd) {
        throw new Error("Failed to generate RLN proof")
    }
    return pcd.toRLNFullProof();
}
