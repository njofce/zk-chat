import { RLNFullProof } from "rlnjs";

export type IServerConfig = {
    serverUrl: string;
    socketUrl: string;
}

export type IStorageArtifacts = {
    leaves: string[],
    depth: number,
    leavesPerNode: number,
};

export type IFuncGenerateProof = (
    // TODO: change `string` to `bigint`
    epoch: string,
    signal: string,
    storage_artifacts: IStorageArtifacts,
    rln_identitifer: string,
) => Promise<RLNFullProof>;

