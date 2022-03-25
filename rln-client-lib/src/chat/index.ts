import { RLNFullProof } from "@zk-kit/protocols";
import { IChatHistoryDB, IMessage, ITimeRangeMessages } from './interfaces';
import { ICryptography } from '../crypto/interfaces';
import { ServerCommunication } from '../communication/index';
import ProfileManager from "../profile";
import Hasher from "../hasher";

/**
 * The core component that is responsible for creating valid ZK proofs for a message, encrypting and dispatching it, as well as receiving and decrypting messages
 * for specific rooms. 
 * This component also takes care of updating the tree root and auth path in case it becomes obsolete.
 */
class ChatManager {
    
    private root_up_to_date: boolean = true;

    private profile_manager: ProfileManager;
    private communication_manager: ServerCommunication;
    private cryptography: ICryptography;
    private message_db: IChatHistoryDB;

    private hasher: Hasher;

    private message_callback;

    private chatHistoryIsSyncing: boolean = false;

    /**
     * Same RLN identifier as the one in server.
     */
    private static RLN_IDENTIFIER = BigInt("11231");

    public static NUM_SHARES: number = 2;

    constructor(profile_manager: ProfileManager, communication_manager: ServerCommunication, cryptography: ICryptography, message_db: IChatHistoryDB) {
        this.profile_manager = profile_manager;
        this.communication_manager = communication_manager;
        this.cryptography = cryptography;
        this.message_db = message_db;

        this.hasher = new Hasher();
    }

    public async setRootObsolete() {
        this.root_up_to_date = false;
    }

    public isRootObsolete() {
        return !this.root_up_to_date;
    }

    public async generateProof(proof_generator_callback: (nullifier: string, signal: string, storage_artifacts: any, rln_identitifer: any) => Promise<any>): Promise<IProofData> {
        let epoch: string = this.getEpoch();

        let externalNullifier: string = this.hasher.genExternalNullifier((epoch));

        const signal: string = this.generateRandomSignal();

        const storageArtifacts = {
            leaves: this.profile_manager.getLeaves(),
            depth: 15,
            leavesPerNode: 2
        };

        const proof: string = await proof_generator_callback(externalNullifier, signal, storageArtifacts, ChatManager.RLN_IDENTIFIER.toString());
        const fullProof: RLNFullProof = JSON.parse(proof);
        const xShare: bigint = this.hasher.genSignalHash(signal);

        return {
            fullProof: fullProof,
            xShare: xShare.toString(),
            epoch: epoch
        }
    }

    public async sendMessage(chat_room_id: string, raw_message: string, proof_generator_callback: (nullifier: string, signal: string, storage_artifacts: any, rln_identitifer: any) => Promise<any>) {
        await this.checkRootUpToDate();
        // Generate proof
        const proofData: IProofData = await this.generateProof(proof_generator_callback);

        // Encrypt with room's key
        const roomData: any = await this.profile_manager.getRoomById(chat_room_id);
        const encryptedMessage: string = await this.profile_manager.encryptMessageForRoom(chat_room_id, raw_message);

        // Send message
        const message = {
            zk_proof: proofData.fullProof,
            x_share: proofData.xShare,
            epoch: proofData.epoch,
            chat_type: roomData.type,
            message_content: encryptedMessage
        }

        this.communication_manager.sendMessage(JSON.stringify(message));
    }

    public async registerReceiveMessageHandler(receive_msg_callback: (message: IMessage, chat_room_id: string) => void) {
        this.message_callback = receive_msg_callback;
        this.communication_manager.receiveMessage(this.messageHandlerForRooms.bind(this))
    }

    private async messageHandlerForRooms(message: string) {
        const [decryptedMessage, room_id] = await this.decryptMessage(JSON.parse(message));

        if (decryptedMessage != null && room_id != null) {
            // Save the message to the local DB.
            this.message_db.saveMessage(room_id, decryptedMessage);

            // When the chat history sync in underway, the callback function 
            // (which would indicate additional interaction with the client) is not called.
            if (!this.chatHistoryIsSyncing) {
                // Return the message to the calling function, usually the UI app, only if history sync is not in progress.
                this.message_callback(decryptedMessage, room_id);
            }
        }
    }

    public async decryptMessage(message: IMessage): Promise<[IMessage | null, string | null]> {
        const room_type = message.chat_type;

        const user_rooms_for_type: any[] = await this.profile_manager.getUserRoomsForChatType(room_type);

        if (user_rooms_for_type.length > 0) {
            for (let room of user_rooms_for_type) {
                try {
                    const decrypted: string = await this.cryptography.decryptMessageSymmetric(message.message_content, room.symmetric_key);
                    return [
                        {
                            uuid: message.uuid,
                            epoch: message.epoch,
                            chat_type: message.chat_type,
                            message_content: decrypted
                        },
                        room.id
                    ];
                } catch (e) {
                    // Do nothing, try the next room
                }
            }
        }

        return [null, null];
    }

    /**
     * Loads all messages from the server, from the max timestamp of the messages stored locally until the 
     * provided toTimestamp, and only stores locally the messages that can be decrypted.
     * 
     * A time-range pagination is implemented, where the server returns a number of messages, no more than a certain limit in a single call. 
     * The pagination loop ends when the number of returned messages is less than the limit.
     */
    public async syncMessagesForAllRooms(toTimestamp: number): Promise<void> {
        // The messages will be loaded starting from MAX_TIMESTAMP of the stored messages + 1ms.
        let fromTimestamp: number = await this.message_db.getMaxTimestampForAllMessages() + 1;

        if (fromTimestamp == -1) {
            fromTimestamp = toTimestamp - 24 * 60 * 60 * 100; 
            // If there are no messages stored locally, load only message history for the given day.
        }

        console.info("Syncing chat history");
        this.chatHistoryIsSyncing = true;
        let messageData: ITimeRangeMessages | null = await this.getAndSaveMessagesForTimeRange(fromTimestamp, toTimestamp);

        while (1) {
            // The server can be unavailable and the returned payload can be null.
            if (messageData == null) {
                break;
            }

            if (messageData.messages.length == messageData.limit) {
                fromTimestamp = parseInt(messageData.returnedToTimestamp) + 1;
                messageData = await this.getAndSaveMessagesForTimeRange(fromTimestamp, toTimestamp);
            } else {
                break;
            }
        }

        console.info("Chat history synced");
        this.chatHistoryIsSyncing = false;
    }

    private async getAndSaveMessagesForTimeRange(fromTimestamp: number, toTimestamp: number): Promise<ITimeRangeMessages | null> {
        let messageData: ITimeRangeMessages = await this.communication_manager.getTimeRangeChatHistory(fromTimestamp, toTimestamp);
        
        if (messageData == null || messageData == undefined) {
            return null;
        }

        for (let message of messageData.messages) {
            const [decryptedMessage, room_id] = await this.decryptMessage(message);

            if (decryptedMessage != null && room_id != null) {
                // Save the decrypted message to the local DB.
                this.message_db.saveMessage(room_id, decryptedMessage);
            }
        }

        return messageData;
    }

    /**
     * Removes all messages for a given room from the local database.
     */
    public async deleteMessageHistoryForRoom(roomId: string) {
        await this.message_db.deleteAllMessagesForRoom(roomId);
    }

    /**
     * Returns the messages with a timestamp lower than fromTimestamp (the returned results are limited) for a given room id.
     */
    public async loadMessagesForRoom(roomId: string, fromTimestamp: number): Promise<IMessage[]> {
        return this.message_db.getMessagesForRoom(roomId, fromTimestamp);
    }

    /**
     * Returns the messages with a timestamp lower than fromTimestamp (the returned results are limited) for the given room ids.
     */
    public async loadMessagesForRooms(roomIds: string[], fromTimestamp: number): Promise<{ [key: string]: IMessage[] }> {
        return this.message_db.getMessagesForRooms(roomIds, fromTimestamp);
    }

    /**
     * Refresh root hash and auth path when needed, only if the root is obsolete.
     */
    public async checkRootUpToDate() {
        if (this.isRootObsolete()) {

            const new_rln_root = await this.communication_manager.getRlnRoot();
            const new_leaves = await this.communication_manager.getLeaves();
            
            this.profile_manager.updateRootHash(new_rln_root);
            this.profile_manager.updateLeaves(new_leaves);

            this.root_up_to_date = true;
        }
    }

    /**
     * Returns rounded timestamp to the nearest 10-second in milliseconds.
     */
    private getEpoch = (): string => {
        const timeNow = new Date();
        timeNow.setSeconds(Math.floor(timeNow.getSeconds() / 10) * 10);
        timeNow.setMilliseconds(0);

        return timeNow.getTime().toString();
    }

    private generateRandomSignal = () => {
        return Math.random().toString();
    }
}

export interface IProofData {
    fullProof: RLNFullProof;
    xShare: string;
    epoch: string;
}

export default ChatManager