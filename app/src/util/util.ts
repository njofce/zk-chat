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
    console.log("!@# app/src/util/util.ts::generateProof: epoch = ", epoch, "signal = ", signal, "rln_identitifer = ", rln_identitifer);
    const pcd = await generateRLNProof(
        BigInt(epoch),
        signal,
        BigInt(rln_identitifer),
        false,
    )
    if (!pcd) {
        throw new Error("Failed to generate RLN proof")
    }
    const fullProof = pcd.toRLNFullProof();
    // NOTE: explicitly convert the `BigInt` to `string` to avoid the error
    const snarkProof = fullProof.snarkProof;
    const publicSignals = snarkProof.publicSignals;
    return {
        snarkProof: {
            proof: snarkProof.proof,
            publicSignals: {
                yShare: String(publicSignals.yShare),
                merkleRoot: String(publicSignals.merkleRoot),
                internalNullifier: String(publicSignals.internalNullifier),
                signalHash: String(publicSignals.signalHash),
                externalNullifier: String(publicSignals.externalNullifier),
            },
        },
        epoch: fullProof.epoch,
        rlnIdentifier: fullProof.rlnIdentifier,
    }
}
