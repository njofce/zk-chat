import Dexie from 'dexie';
import { IChatHistoryDB, IMessage } from "./interfaces";

/**
 * Uses IndexedDB as a persistent database to store all the user's messages in the browser, while using {@link Dexie} as
 * an abstraction layer for interacting with IndexedDB.
 */
export class LocalChatDB implements IChatHistoryDB {
    
    public static MAX_NUMBER_OF_MESSAGES_TO_FETCH_FROM_DB = 100;

    public static DB_NAME = "ZKChatHistory";
    private db: ZKChatDB;

    constructor() {
        this.db = new ZKChatDB();
    }

    /**
     * Save message to IndexedDB.
     */
    public async saveMessage(roomId: string, message: IMessage) {
        await this.db.messages.put({
            uuid: message.uuid,
            roomId: roomId,
            epoch: message.epoch,
            chat_type: message.chat_type,
            message_content: message.message_content,
            timestamp: message.timestamp,
            sender: message.sender
        })
    }

    /**
     * Returns messages for a given room with a maximum limit of {@link LocalChatDB.MAX_NUMBER_OF_MESSAGES_TO_FETCH_FROM_DB},
     * ordered in reverse starting from the message with the nearest timestamp to the provided {@link fromTimestamp}.
     */
    public async getMessagesForRoom(roomId: string, fromTimestamp: number): Promise<IMessage[]> {
        const messages: IZkMessage[] = await this.db.messages
            .orderBy('timestamp')
            .reverse()
            .and(message => {
                return message.roomId == roomId && new Date(message.timestamp) < new Date(fromTimestamp)
            })
            .limit(LocalChatDB.MAX_NUMBER_OF_MESSAGES_TO_FETCH_FROM_DB)
            .toArray();

        return messages.map(message => {
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

    /**
     * Returns messages for the given rooms with a maximum limit of {@link LocalChatDB.MAX_NUMBER_OF_MESSAGES_TO_FETCH_FROM_DB},
     * ordered in reverse starting from the message with the nearest timestamp to the provided {@link fromTimestamp}.
     */
    public async getMessagesForRooms(roomIds: string[], fromTimestamp: number): Promise<{ [key: string]: IMessage[] }> {
        const messagesForRooms: { [key: string]: IMessage[] } = {};

        for (let rId of roomIds) {
            const roomMessages: IMessage[] = await this.getMessagesForRoom(rId, fromTimestamp);
            messagesForRooms[rId] = roomMessages;
        }

        return messagesForRooms;
    }

    /**
     * From all the stored messages in IndexedDB, this method returns the maximum timestamp. In case no messages are found in the local database, -1 is returned.
     */
    public async getMaxTimestampForAllMessages(): Promise<number> {
        const mostRecentMessage = await this.db.messages.orderBy('timestamp').reverse().first();

        if (mostRecentMessage != undefined) {
            return mostRecentMessage.timestamp;
        }

        return -1;
    }

    /**
     * Deletes all messages for a given room.
     */
    public async deleteAllMessagesForRoom(roomId: string) {
        await this.db.messages.where('roomId').equals(roomId).delete();
    }
}

export class ZKChatDB extends Dexie {

    messages!: Dexie.Table<IZkMessage, number>;

    constructor() {
        super(LocalChatDB.DB_NAME);

        this.version(1).stores({
            messages: '++id, roomId, timestamp'
        });
    }
}

interface IZkMessage {
    id?: string;
    uuid: string;
    roomId: string;
    epoch: number;
    chat_type: string;
    message_content: string;
    timestamp: number;
    sender: string;
}