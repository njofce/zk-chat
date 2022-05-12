import Message from '../persistence/model/message/message.model';
import { IMessage } from './../persistence/model/message/message.types';

/**
 * Encapsultes the functionality for handling chat messages.
 */
class ChatService {

    /**
     * The number of messages to return in one request.
     */
    public static MESSAGE_COUNT_LIMIT = 1000;

    /**
     * @deprecated use the endpoint to get messages by time range
     */
    public async getDailyMessages(): Promise<IMessage[]> {
        return (await Message.getDailyMessages())
            .map(message => {
                return {
                    uuid: message.uuid,
                    epoch: message.epoch,
                    chat_type: message.chat_type,
                    message_content: message.message_content,
                    timestamp: message.timestamp,
                    sender: message.sender
                }
            });
    }

    public async getMessagesInTimeRange(from: Date, to: Date): Promise<ITimeRangeMessages> {
        if (from >= to) {
            throw Error("Please select valid date range");
        }

        return await Message.getMessagesInTimeRange(from, to, ChatService.MESSAGE_COUNT_LIMIT);
    }

}

/**
 * When messages for a specified time range are requested, time-based pagination is required. The metadata for the time-based pagination
 * is included in this message, which is returned by the server, along with a subset of all the messages within that range.
 */
export interface ITimeRangeMessages {
    requestedFromTimestamp: number;
    requestedToTimestamp: number;
    returnedFromTimestamp: number;
    returnedToTimestamp: number;
    messages: IMessage[];
    limit: number;
}

export default ChatService