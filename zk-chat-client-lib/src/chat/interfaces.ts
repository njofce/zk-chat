/**
 * Indicates an infite persistant storage used to store the decrypted messages locally.
 */
export type IChatHistoryDB = {
    
    /**
    * Save the decrypted message for the given room.
    */
    saveMessage(roomId: string, message: IMessage);

    /**
    * Return all messages for a room with timestamps lower than the provided {@link fromTimestamp} up to a certain limit.
    * This method is used to ensure time-based pagination.
    */
    getMessagesForRoom(roomId: string, fromTimestamp: number): Promise<IMessage[]>;

    /**
    * Return all messages for the given rooms with timestamps lower than the provided {@link fromTimestamp} up to a certain limit.
    * This method is used to ensure time-based pagination.
    */
    getMessagesForRooms(roomIds: string[], fromTimestamp: number): Promise<{ [key: string]: IMessage[] }>;
    
    /**
    * Returns the maximum timestamp from all the stored messages.
    */
    getMaxTimestampForAllMessages(): Promise<number>;

    /**
     * Deletes all messages for a given room.
     */
    deleteAllMessagesForRoom(roomId: string);

}

/**
 * Core interface of the messages that are broadcast by the server. This is the type of all messages received by clients.
 */
export type IMessage = {
    uuid: string;
    epoch: number;
    chat_type: string;
    message_content: string;
    timestamp: number;
    sender: string;
}

/**
 * Core interface of the message returned by the server that contains time-based paginated messages.
 */
export type ITimeRangeMessages = {
    requestedFromTimestamp: string;
    requestedToTimestamp: string;
    returnedFromTimestamp: string;
    returnedToTimestamp: string;
    messages: IMessage[];
    limit: number;
}