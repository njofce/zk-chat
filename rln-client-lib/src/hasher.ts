import { NRLN, genExternalNullifier, genSignalHash } from "@zk-kit/protocols"

export default class Hasher {

    constructor() { }

    public genSignalHash(inputs: string): bigint {
        return genSignalHash(inputs);
    }

    public genExternalNullifier(data: string): string {
        return genExternalNullifier(data);
    }

    public genWitness(identitySecret, witness, externalNullifier, signal, rln_id) {
        return NRLN.genWitness(identitySecret, witness, externalNullifier, signal, rln_id);
    }

    public async genProof(proofWitness, circuit_path, key_path) {
        return NRLN.genProof(proofWitness, circuit_path, key_path);
    }

    public calculateOutput(identitySecret, externalNullifier, xShare, share_count, rln_id) {
        return NRLN.calculateOutput(identitySecret, externalNullifier, xShare, share_count, rln_id);
    }
}
