import { Model, Document } from "mongoose";
import { getDailyMessages, getMessagesInTimeRange, deleteMessagesOlderThanDate } from "./message.statics";

export interface IMessage {
    uuid: string;
    epoch: number;
    chat_type: string;
    message_content: string;
    timestamp: number;
}

export interface IMessageDocument extends IMessage, Document {}
export interface IMessageModel extends Model<IMessageDocument> {
    getDailyMessages: typeof getDailyMessages;
    getMessagesInTimeRange: typeof getMessagesInTimeRange;
    deleteMessagesOlderThanDate: typeof deleteMessagesOlderThanDate;
}