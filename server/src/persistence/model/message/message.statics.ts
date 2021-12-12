import Message from "./message.model";
import { IMessage } from "./message.types";

/**
 * @returns all the messages that were stored for the day when the function gets called
 */
export async function getDailyMessages(this: typeof Message,): Promise<IMessage[]> {
    return this.find({ epoch: { $gte: new Date(new Date().setHours(0, 0, 0, 0)).getTime() }});
}
