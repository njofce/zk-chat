import { RLNFullProof } from '@zk-kit/protocols';
import { getYShareFromFullProof } from './../util/types';
import * as path from "path";
import * as fs from "fs";

import { IMessage } from '../persistence/model/message/message.types';
import Message from "../persistence/model/message/message.model";
import PubSub from '../communication/pub_sub';
import { ISyncMessage, SyncType } from '../communication/socket/config';
import UserService from './user.service';
import RequestStatsService from "./request_stats.service";
import config from "../config";
import { randomUUID } from "crypto";
import Hasher from "../util/hasher";
import { constructRLNMessage, RLNMessage } from "../util/types";

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
        if (!this.verifyEpoch(validMessage))
            throw "Epoch invalid";

        // Check if message is duplicate
        if (await this.requestStatsService.isDuplicate(validMessage))
            throw "Message is a duplicate";

        // Check valid proof
        const merkleRoot: string = await this.userService.getRoot();
        const validZkProof = await this.isZkProofValid(validMessage.zk_proof, merkleRoot);

        if (!validZkProof) {
            throw "ZK Proof is invalid, ignoring message";
        }
        
        // Check spam rules
        const spamRulesViolated = await this.areSpamRulesViolated(validMessage);

        if (spamRulesViolated) {
            const requestStats = await this.requestStatsService.getRequestStats(validMessage);

            const sharesX = requestStats.map((stats) => BigInt(stats.xShare));
            const sharesY = requestStats.map((stats) => BigInt(stats.yShare));

            sharesX.push(BigInt(validMessage.x_share));
            sharesY.push(BigInt(getYShareFromFullProof(validMessage.zk_proof)));
            const secret: bigint = this.hasher.retrieveSecret(sharesX, sharesY);
            const idCommitment = this.hasher.poseidonHash([secret]).toString();

            // Ban User
            await this.userService.removeUser(idCommitment, secret);

            // Set user leaf to 0 and recalculate merkle tree
            await this.userService.updateUser(idCommitment);

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

    private verifyEpoch = (message: RLNMessage): boolean => {
        const serverTimestamp = new Date();
        
        serverTimestamp.setSeconds(Math.floor(serverTimestamp.getSeconds() / 10) * 10);
        serverTimestamp.setMilliseconds(0);
        const messageTimestamp = new Date(parseInt(message.epoch));

        // Tolerate a difference of TIMESTAMP_TOLERATED_DIFFERENCE_SECONDS seconds between client and server timestamp
        const difference_in_seconds = Math.abs(serverTimestamp.getTime() - messageTimestamp.getTime()) / 1000;
        if (difference_in_seconds >= config.EPOCH_ALLOWED_DELAY_THRESHOLD)
            return false;

        return true;
    }

    private isZkProofValid = async (proof: RLNFullProof, root: string): Promise<boolean> => {

        return await this.hasher.verifyProof(this.verifierKey, {
            proof: proof.proof,
            publicSignals: {
                yShare: proof.publicSignals.yShare,
                merkleRoot: root,
                internalNullifier: proof.publicSignals.internalNullifier,
                signalHash: proof.publicSignals.signalHash,
                epoch: proof.publicSignals.epoch,
                rlnIdentifier: proof.publicSignals.rlnIdentifier,
            }
        });
    }

    private areSpamRulesViolated = async (message: RLNMessage): Promise<boolean> => {
        return this.requestStatsService.isSpam(message, config.SPAM_TRESHOLD);
    }

    private persistMessage = async (message: RLNMessage): Promise<IMessage> => {
        const msg = await Message.create({
            uuid: randomUUID(),
            epoch: message.epoch,
            chat_type: message.chat_type,
            message_content: message.message_content
        });

        return await msg.save();
    }

}

export default MessageHandlerService;