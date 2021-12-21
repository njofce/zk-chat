export interface IInterRepGroup {
    id: string;
    provider: string;
    name: string;
    size: number;
}

export interface IInterRepGroupV2 {
    rootHash: string;
    provider: string;
    name: string;
    size: number;
}

export interface IGroupMember {
    index: number;
    identityCommitment: string;
}
