import { poseidon } from "circomlib";
import { genExternalNullifier, generateMerkleProof } from "@zk-kit/protocols"
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { RLN, RLNFullProof, StrBigInt, VerificationKey } from "rlnjs";

/**
 * A wrapper class for circomlib & semaphore library functions.
 */
export default class Hasher {

    constructor() {
        (BigInt.prototype as any).toJSON = function () {
            return this.toString();
        };
    }

    /**
     * Generates a poseidon hash for the provided input array.
     */
    public poseidonHash(inputs: BigInt[]): BigInt {
        return poseidon(inputs);
    }

    /**
     * Generates the external nullifier for the provided data.
     */
    public genExternalNullifier(data: string): string {
        return genExternalNullifier(data);
    }

    /**
     * Extracts the secret by looking at X & Y shares.
     */
    public retrieveSecret(sharesX: bigint[], sharesY: bigint[]): bigint {
        return RLN._shamirRecovery(sharesX[0], sharesX[1], sharesY[0], sharesY[1]);
    }

    /**
     * Verifies a RLN proof using the verifier key.
     */
    public async verifyProof(verifierKey: VerificationKey, proof: RLNFullProof): Promise<boolean> {
        // Inline rln.verifyProof
        const expectedExternalNullifier = BigInt(RLN._genNullifier(BigInt(proof.epoch), BigInt(proof.rlnIdentifier)));
        const actualExternalNullifier = BigInt(proof.snarkProof.publicSignals.externalNullifier);
        if (expectedExternalNullifier !== actualExternalNullifier) {
            console.log("!@# externalNullifier mismatch: expected = ", expectedExternalNullifier, ", actual = ", actualExternalNullifier);
            return false;
        }
        return await RLN.verifySNARKProof(verifierKey, proof.snarkProof);
    }

    /**
     * Generates a merkle proof for a given target leaf and all the leaves in the tree.
     * @param leaves all leaves in the merkle tree
     * @param targetLeaf the target leaf
     * @returns
     */
    public async generateMerkleProof(leaves: string[], targetLeaf: string, treeLevels: number, zeroValue: StrBigInt): Promise<MerkleProof> {
        return generateMerkleProof(treeLevels, zeroValue, leaves, targetLeaf);
    }
}
