import { poseidon } from "circomlib";
import { NRLN, genExternalNullifier, FullProof } from "@zk-kit/protocols"

/**
 * A wrapper class for circomlib & semaphore library functions.
 */
export default class Hasher {

    constructor() {}

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
        return NRLN.retrieveSecret(sharesX, sharesY);
    }

    /**
     * Verifies a RLN proof using the verifier key.
     */
    public async verifyProof(verifierKey: any, proof: FullProof): Promise<boolean> {
        return await NRLN.verifyProof(verifierKey, proof);
    }
}
