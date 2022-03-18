import { RLNFullProof } from '@zk-kit/protocols';
import Hasher from '../util/hasher';
import { IKeyExchangeBundle } from '../persistence/model/key_exchange_bundle/key_exchange_bundle.types';
import KeyExchangeBundleRequestStatsService from './key_exchange_bundle_request_service';

import * as path from "path";
import * as fs from "fs";
import { isZkProofValid, verifyEpoch } from '../util/proof_utils';
import UserService from './user.service';
import config from '../config';
import KeyExchangeBundle from '../persistence/model/key_exchange_bundle/key_exchange_bundle.model';

/**
 * Encapsulates the functionality for performing a key exchange between two users.
 */
class KeyExchangeService {

    private userService: UserService;
    private keyExchangeBundleRequestStatsService: KeyExchangeBundleRequestStatsService;
    private hasher: Hasher;
    private verifierKey: any;

    constructor(userService: UserService, keyExchangeBundleRequestStatsService: KeyExchangeBundleRequestStatsService, hasher: Hasher) {
        this.userService = userService;
        this.keyExchangeBundleRequestStatsService = keyExchangeBundleRequestStatsService;
        this.hasher = hasher;

        const keyPath = path.join("./circuitFiles/rln", "verification_key.json");
        this.verifierKey = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
    }

    public async getBundles(receiverPublicKey: string): Promise<IPublicKeyExchangeBundle[]> {
        return (await KeyExchangeBundle.getKeyExchangeBundlesByReceiverPublicKey(receiverPublicKey)).map(bundle => {
            return {
                encrypted_content: bundle.encrypted_content,
                encrypted_key: bundle.encrypted_key,
                receiver_public_key: bundle.receiver_public_key
            }
        });
    }

    public async createBundle(createBundleMessage: ICreateBundleMessage): Promise<IPublicKeyExchangeBundle> {
        await this.validateMessageRules(createBundleMessage.zk_proof, createBundleMessage.epoch, createBundleMessage.x_share);

        const bundle = await KeyExchangeBundle.create({
            encrypted_content: createBundleMessage.encrypted_content,
            content_hash: createBundleMessage.content_hash,
            encrypted_key: createBundleMessage.encrypted_key,
            receiver_public_key: createBundleMessage.receiver_public_key
        })

        const savedBundle: IKeyExchangeBundle = await bundle.save();

        return {
            encrypted_content: savedBundle.encrypted_content,
            encrypted_key: savedBundle.encrypted_key,
            receiver_public_key: savedBundle.receiver_public_key
        }
    }

    public async deleteBundles(deleteBundlesMessages: IDeleteBundlesMessage): Promise<number> {
        await this.validateMessageRules(deleteBundlesMessages.zk_proof, deleteBundlesMessages.epoch, deleteBundlesMessages.x_share);

        let deletedItemsCount = 0;
        for (let bundle of deleteBundlesMessages.bundles) {
            deletedItemsCount += await KeyExchangeBundle.deleteKeyExchangeBundles(bundle.content_hash, bundle.receiver_public_key);
        }

        return deletedItemsCount;
    }

    private async validateMessageRules(zk_proof: RLNFullProof, epoch: string, x_share: string) {
        // Validate epoch
        if (!verifyEpoch(epoch))
            throw "Epoch invalid";

        // Check if message is duplicate
        if (await this.keyExchangeBundleRequestStatsService.isDuplicate(zk_proof, epoch, x_share))
            throw "Message is a duplicate";

        // Check valid proof
        const merkleRoot: string = await this.userService.getRoot();
        const validZkProof = await isZkProofValid(this.hasher, this.verifierKey, zk_proof, merkleRoot);

        if (!validZkProof) {
            throw "ZK Proof is invalid, ignoring message";
        }

        // Check spam rules
        if (await this.keyExchangeBundleRequestStatsService.isSpam(zk_proof, epoch, config.SPAM_TRESHOLD)) {
            throw "Message is a spam, ignoring"
        }

        await this.keyExchangeBundleRequestStatsService.saveMessage(zk_proof, epoch, x_share);
    }

}

export interface IZkProofMetadata {
    zk_proof: RLNFullProof;
    epoch: string;
    x_share: string;
}

export interface IKeyBundleMetadata {
    content_hash: string;
    receiver_public_key: string;
}

export interface ICreateBundleMessage extends IZkProofMetadata {
    encrypted_content: string;
    content_hash: string;
    encrypted_key: string;
    receiver_public_key: string;
}

export interface IDeleteBundlesMessage extends IZkProofMetadata {
    bundles: IKeyBundleMetadata[]
}


/**
 * The bundle that will be returned by the server. The content is same as {@link IKeyExchangeBundle} without the content_hash,
 * which should be kept private within the server.
 */
export interface IPublicKeyExchangeBundle {
    encrypted_content: string;
    encrypted_key: string;
    receiver_public_key: string;
}

export default KeyExchangeService