import * as path from "path";
import * as fs from "fs";

import { randomUUID } from "crypto";
import { constructRLNMessage, RLNMessage } from "../util/types";
import { getUserFromShares, isZkProofValid, verifyEpoch } from '../util/proof_utils';
import { IMessage } from '../persistence/model/message/message.types';
import { ISyncMessage, SyncType } from '../communication/socket/config';
import Message from "../persistence/model/message/message.model";
import PubSub from '../communication/pub_sub';
import UserService from './user.service';
import RequestStatsService from "./request_stats.service";
import config from "../config";
import Hasher from "../util/hasher";

/**
 * The core service that handles every message coming from the websocket channel. The message format is deserialized and validated properly.
 * The spam rules, as well as the zero knowledge proofs are validated properly, and use is banned if the spam rules are broken.
 * 
 * When all the checks succeed, the message is persisted in the database and broadcast to all active users.
 */
class MessageHandlerService {

    private pubSub: PubSub;
    private userService: UserService;
    private requestStatsService: RequestStatsService;
    private hasher: Hasher;
    private verifierKey: any;

    constructor(pubSub: PubSub, userService: UserService, requestStatsService: RequestStatsService, hasher: Hasher) {
        this.pubSub = pubSub;
        this.userService = userService;
        this.requestStatsService = requestStatsService;
        this.hasher = hasher;

        const keyPath = path.join("./circuitFiles/rln", "verification_key.json");
        this.verifierKey = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
    }

    public handleChatMessage = async (message: string): Promise<IMessage> => {
        // Validate format of the RLN message
        const validMessage: RLNMessage | null = await this.validateFormat(message);
        if (validMessage == null) 
            throw "Message format invalid";

        // Validate epoch
        if (!verifyEpoch(validMessage.epoch))
            throw "Epoch invalid";

        // Check if message is duplicate
        if (await this.requestStatsService.isDuplicate(validMessage))
            throw "Message is a duplicate";

        // Check valid proof
        const merkleRoot: string = await this.userService.getRoot();
        const validZkProof = await isZkProofValid(this.hasher, this.verifierKey, validMessage.zk_proof, merkleRoot);

        if (!validZkProof) {
            throw "ZK Proof is invalid, ignoring message";
        }
        
        // Check spam rules
        const spamRulesViolated = await this.areSpamRulesViolated(validMessage);

        if (spamRulesViolated) {
            const requestStats = await this.requestStatsService.getRequestStats(validMessage);

            const user = getUserFromShares(validMessage.zk_proof, validMessage.x_share, this.hasher, requestStats);

            // Ban User
            await this.userService.banUser(user.idCommitment, user.secret);

            // Set user leaf to 0 and recalculate merkle tree
            await this.userService.updateUser(user.idCommitment);

            // Broadcast tree updated event
            const treeUpdated: ISyncMessage = {
                type: SyncType.EVENT,
                message: "TREE_UPDATE"
            };
            this.pubSub.publish(treeUpdated);

            throw "Message is a spam, banning user and ignoring message";
        }

        // Persist message and broadcast
        const persistedMessage: IMessage = await this.persistMessage(validMessage);
        await this.requestStatsService.saveMessage(validMessage);

        const syncMessage: ISyncMessage = {
            type: SyncType.MESSAGE,
            message: JSON.stringify(persistedMessage)
        };
        this.pubSub.publish(syncMessage);

        return persistedMessage;
    }

    private validateFormat = async (message: string): Promise<RLNMessage | null> => {
        try {
            const parsedJson = JSON.parse(message);
            return constructRLNMessage(parsedJson);
        } catch(e) {
            return null;
        }
    }

    private areSpamRulesViolated = async (message: RLNMessage): Promise<boolean> => {
        return this.requestStatsService.isSpam(message, config.SPAM_TRESHOLD);
    }

    private persistMessage = async (message: RLNMessage): Promise<IMessage> => {
        const msg = await Message.create({
            uuid: randomUUID(),
            epoch: message.epoch,
            chat_type: message.chat_type,
            message_content: message.message_content,
            timestamp: new Date().getTime()
        });

        return await msg.save();
    }

}

export default MessageHandlerService;