import schedule from "node-schedule"
import config from "../config";
import Message from "../persistence/model/message/message.model";


const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Removes the messages older than the specified number of days.
 */
export async function runMessageCleanupJob() {
    console.log("Scheduling the cleanup job");
    
    schedule.scheduleJob(`0 0 */1 * *`, { tz: "Etc/UTC" }, async () => {
        try {
           
            const timestampNow = new Date().getTime();
            const timestampToDeleteFrom = timestampNow - MS_PER_DAY * config.DELETE_MESSAGES_OLDER_THAN_DAYS;
            await Message.deleteMessagesOlderThanDate(timestampToDeleteFrom);
        } catch (error: any) {
            console.log("Error while running message cleanup job", error);
        }
    })

}