import { IShares } from "../request_stats/request_stats.types";
import KeyExchangeRequestStats from "./key_exchange_request_stats.model";
import { IKeyExchangeRequestStats } from "./key_exchange_request_stats.types";

export async function getSharesForEpochForUser(
    this: typeof KeyExchangeRequestStats,
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
    this: typeof KeyExchangeRequestStats,
    epoch: string
): Promise<IKeyExchangeRequestStats[]> {
    return this.find({ epoch });
}

export async function isDuplicateRequest(
    this: typeof KeyExchangeRequestStats,
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
    this: typeof KeyExchangeRequestStats,
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
