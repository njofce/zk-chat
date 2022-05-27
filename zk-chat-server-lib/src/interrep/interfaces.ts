export interface IInterRepGroup {
    id: string;
    provider: string;
    name: string;
    size: number;
}

export interface IInterRepGroupV2 {
    root: string;
    provider: string;
    name: string;
    size: number;
    numberOfLeaves: number;
}

export interface IGroupMember {
    index: number;
    identityCommitment: string;
}
