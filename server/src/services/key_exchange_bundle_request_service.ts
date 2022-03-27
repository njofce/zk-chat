import { RLNFullProof } from '@zk-kit/protocols';
import { getYShareFromFullProof } from './../util/types';
import KeyExchangeRequestStats from "../persistence/model/key_exchange_request_stats/key_exchange_request_stats.model"
import { getNullifierFromFullProof } from "../util/types";

/**
 * Encapsulates the functionality of handling the request stats for key exchange messages, for detecting spam and duplicates. 
 */
class KeyExchangeBundleRequestStatsService {

    public async saveMessage(zk_proof: RLNFullProof, epoch: string, x_share: string) {

        const req_stats = await KeyExchangeRequestStats.create({
            nullifier: getNullifierFromFullProof(zk_proof),
            epoch: epoch,
            xShare: x_share,
            yShare: getYShareFromFullProof(zk_proof)
        })

        await req_stats.save();
    }

    public async getRequestStats(epoch: string, zk_proof: RLNFullProof) {
        return await KeyExchangeRequestStats.getSharesForEpochForUser(epoch, getNullifierFromFullProof(zk_proof));
    }

    public async isDuplicate(zk_proof: RLNFullProof, epoch: string, x_share: string): Promise<boolean> {
        return await KeyExchangeRequestStats.isDuplicateRequest(epoch, getNullifierFromFullProof(zk_proof), x_share, getYShareFromFullProof(zk_proof));
    }

    public async isSpam(zk_proof: RLNFullProof, epoch: string, spamThreshold: number): Promise<boolean> {
        return await KeyExchangeRequestStats.isSpamRequest(epoch, getNullifierFromFullProof(zk_proof), spamThreshold);
    }

}

export default KeyExchangeBundleRequestStatsService