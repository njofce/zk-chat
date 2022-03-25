import { ITimeRangeMessages } from "../../../services/chat.service";
import Message from "./message.model";
import { IMessage } from "./message.types";

/**
 * @returns all the messages that were stored for the day when the function gets called
 * @deprecated use the endpoint to get messages by time range
 */
export async function getDailyMessages(this: typeof Message,): Promise<IMessage[]> {
    return this.find({ epoch: { $gte: new Date(new Date().setHours(0, 0, 0, 0)).getTime() }});
}

export async function getMessagesInTimeRange(this: typeof Message, from: Date, to: Date, limit: number): Promise<ITimeRangeMessages> {

    const foundMessagesOrdered: IMessage[] = await this.find({ epoch: { $gte: from.getTime(), $lt: to.getTime() } }, null, {limit: limit, sort: {epoch: 1}}).exec();

    const returnedFromTimestamp: number = foundMessagesOrdered.length > 0 ? foundMessagesOrdered[0].epoch : from.getTime();
    const returnedToTimestamp: number = foundMessagesOrdered.length > 0 ? foundMessagesOrdered[foundMessagesOrdered.length - 1].epoch : to.getTime();

    return {
        requestedFromTimestamp: from.getTime(),
        requestedToTimestamp: to.getTime(),
        returnedFromTimestamp: returnedFromTimestamp,
        returnedToTimestamp: returnedToTimestamp,
        messages: foundMessagesOrdered,
        limit: limit
    }
}