import schedule from "node-schedule"
import Message from "../persistence/model/message/message.model";
import { IZKServerConfig } from "../types";


const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Removes the messages older than the specified number of days.
 */
export async function runMessageCleanupJob(config: IZKServerConfig) {
    console.log("Scheduling the cleanup job");
    
    schedule.scheduleJob(`0 0 */1 * *`, { tz: "Etc/UTC" }, async () => {
        try {
           
            const timestampNow = new Date().getTime();
            const timestampToDeleteFrom = timestampNow - MS_PER_DAY * config.deleteMessagesOlderThanDays;
            await Message.deleteMessagesOlderThanDate(timestampToDeleteFrom);
        } catch (error: any) {
            console.log("Error while running message cleanup job", error);
        }
    })

}