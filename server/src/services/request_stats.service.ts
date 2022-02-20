import { getYShareFromFullProof } from './../util/types';
import RequestStats from "../persistence/model/request_stats/request_stats.model"
import { getNullifierFromFullProof, RLNMessage } from "../util/types";

/**
 * Encapsulates the functionality of handling the request stats, for detecting spam and duplicates.
 */
class RequestStatsService {

    public async saveMessage(message: RLNMessage) {
        
        const req_stats = await RequestStats.create({
            nullifier: getNullifierFromFullProof(message.zk_proof), // internal nullifier is the third public signal
            epoch: message.epoch,
            xShare: message.x_share,
            yShare: getYShareFromFullProof(message.zk_proof), // y share is the first public signal
        })

        await req_stats.save();
    }

    public async getRequestStats(message: RLNMessage) {
        return await RequestStats.getSharesForEpochForUser(message.epoch, getNullifierFromFullProof(message.zk_proof));
    }

    public async isDuplicate(message: RLNMessage): Promise<boolean> {
        return await RequestStats.isDuplicateRequest(message.epoch, getNullifierFromFullProof(message.zk_proof), message.x_share, getYShareFromFullProof(message.zk_proof));
    }

    public async isSpam(message: RLNMessage, spamThreshold: number): Promise<boolean> {
        return await RequestStats.isSpamRequest(message.epoch, getNullifierFromFullProof(message.zk_proof), spamThreshold);
    }

}

export default RequestStatsService