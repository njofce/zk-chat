import RequestStats from "../persistence/model/request_stats/request_stats.model"
import { RLNMessage } from "../util/types";

class RequestStatsService {

    public async saveMessage(message: RLNMessage) {
        
        const req_stats = await RequestStats.create({
            nullifier: message.nullifier,
            epoch: message.epoch,
            xShare: message.xShare,
            yShare: message.yShare,
        })

        await req_stats.save();
    }

    public async getRequestStats(message: RLNMessage) {
        return await RequestStats.getSharesForEpochForUser(message.epoch, message.nullifier);
    }

    public async isDuplicate(message: RLNMessage): Promise<boolean> {
        return await RequestStats.isDuplicateRequest(message.epoch, message.nullifier, message.xShare, message.yShare);
    }

    public async isSpam(message: RLNMessage, spamThreshold: number): Promise<boolean> {
        return await RequestStats.isSpamRequest(message.epoch, message.nullifier, spamThreshold);
    }

}

export default RequestStatsService