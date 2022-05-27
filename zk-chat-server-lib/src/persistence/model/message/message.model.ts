import { IMessageDocument, IMessageModel } from './message.types';
import { model } from "mongoose";
import MessageSchema from './message.schema';

const MODEL_NAME = "Message";

const Message: IMessageModel = model<
    IMessageDocument,
    IMessageModel
>(MODEL_NAME, MessageSchema, "messages");

export default Message;
