import { IMessage, IMessageDocument, IMessageModel } from './message.types';
import { Schema } from "mongoose";
import { getDailyMessages, getMessagesInTimeRange } from './message.statics';

const MessageSchemaFields: Record<keyof IMessage, any> = {
    uuid: { type: String, required: true, unique: true },
    epoch: { type: Number, required: true, unique: false },
    chat_type: { type: String, required: true, unique: false },
    message_content: { type: String, required: true, unique: false },
};

const MessageSchema = new Schema<IMessageDocument, IMessageModel>(
    MessageSchemaFields
);

MessageSchema.statics.getDailyMessages = getDailyMessages;
MessageSchema.statics.getMessagesInTimeRange = getMessagesInTimeRange;

export default MessageSchema;