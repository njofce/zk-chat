import RequestStats from "./request_stats.model";
import { IRequestStats, IShares } from "./request_stats.types";

export async function getSharesForEpochForUser(
    this: typeof RequestStats,
    epoch: string,
    nullifier: string
): Promise<IShares[]> {
    return this.find(
        {
            epoch,
            nullifier,
        },
        { xShare: 1, yShare: 1 }
    );
}

export async function getByEpoch(
    this: typeof RequestStats,
    epoch: string
): Promise<IRequestStats[]> {
    return this.find({ epoch });
}

export async function isDuplicateRequest(
    this: typeof RequestStats,
    epoch: string,
    nullifier: string,
    xShare: string,
    yShare: string
): Promise<boolean> {
    const request = await this.findOne({
        epoch,
        nullifier,
        xShare,
        yShare,
    });
    return request ? true : false;
}

export async function isSpamRequest(
    this: typeof RequestStats,
    epoch: string,
    nullifier: string,
    numRequests: number
): Promise<boolean> {
    const requests = await this.aggregate([
        {
            $match: {
                epoch,
                nullifier,
            },
        },
        {
            $count: "num_requests",
        },
    ]);

    return requests.length === 1 && requests[0].num_requests >= numRequests;
}
