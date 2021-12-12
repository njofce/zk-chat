import { NRln, genExternalNullifier, genSignalHash } from "@libsem/protocols"

export default class Hasher {

    constructor() { }

    public genSignalHash(inputs: string): bigint {
        return genSignalHash(inputs);
    }

    public genExternalNullifier(data: string): string {
        return genExternalNullifier(data);
    }

    public genWitness(identitySecret, witness, externalNullifier, signal, rln_id) {
        return NRln.genWitness(identitySecret, witness, externalNullifier, signal, rln_id);
    }

    public async genProof(proofWitness, circuit_path, key_path) {
        return NRln.genProof(proofWitness, circuit_path, key_path);
    }

    public calculateOutput(identitySecret, externalNullifier, xShare, share_count, rln_id) {
        return NRln.calculateOutput(identitySecret, externalNullifier, xShare, share_count, rln_id);
    }
}
