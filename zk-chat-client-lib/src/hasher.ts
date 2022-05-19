import { genExternalNullifier, RLN } from "@zk-kit/protocols"

export default class Hasher {

    constructor() { }

    public genSignalHash(inputs: string): bigint {
        return RLN.genSignalHash(inputs);
    }

    public genExternalNullifier(data: string): string {
        return genExternalNullifier(data);
    }
}
