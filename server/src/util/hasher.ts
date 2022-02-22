import { poseidon } from "circomlib";
import { RLN, genExternalNullifier, generateMerkleProof, MerkleProof, RLNFullProof } from "@zk-kit/protocols"
import config from '../config';
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
        return RLN.retrieveSecret(sharesX[0], sharesX[1], sharesY[0], sharesY[1]);
    }

    /**
     * Verifies a RLN proof using the verifier key.
     */
    public async verifyProof(verifierKey: any, proof: RLNFullProof): Promise<boolean> {
        return await RLN.verifyProof(verifierKey, proof);
    }

    /**
     * Generates a merkle proof for a given target leaf and all the leaves in the tree.
     * @param leaves all leaves in the merkle tree
     * @param targetLeaf the target leaf
     * @returns 
     */
    public async generateMerkleProof(leaves: string[], targetLeaf: string): Promise<MerkleProof> {
        return generateMerkleProof(config.MERKLE_TREE_LEVELS, config.ZERO_VALUE, 2, leaves, targetLeaf);
    }
}
