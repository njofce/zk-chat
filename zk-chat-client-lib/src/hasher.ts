import { genExternalNullifier } from "@zk-kit/protocols"

import { RLN } from "rlnjs"

export default class Hasher {

    constructor() { }

    public genSignalHash(inputs: string): bigint {
        return RLN._genSignalHash(inputs);
    }

    public genExternalNullifier(data: string): string {
        return genExternalNullifier(data);
    }
}
