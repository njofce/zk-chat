import { poseidon } from "circomlib";
import { NRln, genExternalNullifier, FullProof } from "@libsem/protocols"

export default class Hasher {

    constructor() {}

    public poseidonHash(inputs: BigInt[]): BigInt {
        return poseidon(inputs);
    }

    public genExternalNullifier(data: string): string {
        return genExternalNullifier(data);
    }

    public retrieveSecret(sharesX: bigint[], sharesY: bigint[]): bigint {
        return NRln.retrieveSecret(sharesX, sharesY);
    }

    public async verifyProof(verifierKey: any, proof: FullProof): Promise<boolean> {
        return await NRln.verifyProof(verifierKey, proof);
    }
}
