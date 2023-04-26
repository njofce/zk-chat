export interface ISemaphoreRepGroup {
    id: string;
    provider: string;
    name: string;
    size: number;
}

export interface ISemaphoreRepGroupV2 {
    id: string;
    name: string;
    deep: number;
}

export interface IGroupMember {
    index: number;
    identityCommitment: string;
}