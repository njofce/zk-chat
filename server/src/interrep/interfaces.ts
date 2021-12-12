export interface IInterRepGroup {
    id: string;
    provider: string;
    name: string;
    size: number;
}

export interface IGroupMember {
    index: number;
    identityCommitment: string;
}
