import * as path from "path";

import { ICryptography } from '../crypto/interfaces';
import { ServerCommunication } from '../communication/index';
import ProfileManager from "../profile";
import Hasher from "../hasher";

/**
 * TODO: Add docs
 */
class ChatManager {
    
    private root_up_to_date: boolean = true;

    private profile_manager: ProfileManager;
    private communication_manager: ServerCommunication;
    private cryptography: ICryptography;

    private hasher: Hasher;

    private message_callback;

    private prover_key_path: string;
    private circuit_path: string;

    private static RLN_IDENTIFIER = BigInt("1234");

    constructor(profile_manager: ProfileManager, communication_manager: ServerCommunication, cryptography: ICryptography) {
        this.profile_manager = profile_manager;
        this.communication_manager = communication_manager;
        this.cryptography = cryptography;

        this.hasher = new Hasher();

        this.prover_key_path = path.join("circuitFiles/rln", "rln_final.zkey");
        this.circuit_path = path.join("circuitFiles/rln", "rln.wasm");
    }

    public async setRootObsolete() {
        this.root_up_to_date = false;
    }

    public isRootObsolete() {
        return !this.root_up_to_date;
    }

    public async sendMessage(chat_room_id: string, raw_message: string) {
        await this.checkRootUpToDate();

        // Generate proof
        let epoch: string = this.getEpoch();
        const externalNullifier = this.hasher.genExternalNullifier(epoch);
        const signal: string = this.generateRandomSignal()
        const xShare: bigint = this.hasher.genSignalHash(signal);

        const identitySecret: bigint[] = this.profile_manager.getIdentitySecret();
        const witness = JSON.parse(this.profile_manager.getAuthPath());

        const proofWitness = this.hasher.genWitness(identitySecret, witness, externalNullifier, signal, ChatManager.RLN_IDENTIFIER);
    
        const fullProof = await this.hasher.genProof(proofWitness, this.circuit_path, this.prover_key_path);

        const [yShare, nullifier] = this.hasher.calculateOutput(
            identitySecret,
            BigInt(externalNullifier),
            xShare,
            10,
            ChatManager.RLN_IDENTIFIER
        );

        // Encrypt with room's key
        const roomData: any = await this.profile_manager.getRoomById(chat_room_id);
        const encryptedMessage: string = await this.profile_manager.encryptMessageForRoom(chat_room_id, raw_message);

        // Send message
        const message = {
            zk_proof: fullProof.proof,
            nullifier: nullifier.toString(),
            epoch: epoch,
            xShare: xShare.toString(),
            yShare: yShare.toString(),
            chat_type: roomData.type,
            message_content: encryptedMessage
        }

        this.communication_manager.sendMessage(JSON.stringify(message));
    }

    public async registerReceiveMessageHandler(receive_msg_callback: (message: any, chat_room_id: string) => void) {
        this.message_callback = receive_msg_callback;
        this.communication_manager.receiveMessage(this.messageHandlerForRooms.bind(this))
    }

    private async messageHandlerForRooms(message: string) {
        const [decryptedMessage, room_id] = await this.decryptMessage(JSON.parse(message));

        if (decryptedMessage != null && room_id != null) {
            this.message_callback(decryptedMessage, room_id);
        }
    }

    public async decryptMessage(message: any): Promise<any> {
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
     * Refresh root hash and auth path when needed, only if the root is obsolete.
     */
    public async checkRootUpToDate() {
        if (this.isRootObsolete()) {

            const new_rln_root = await this.communication_manager.getRlnRoot();
            const new_auth_path = await this.communication_manager.getUserAuthPath(this.profile_manager.getIdentityCommitment());
            
            this.profile_manager.updateRootHash(new_rln_root);
            this.profile_manager.updateAuthPath(JSON.stringify(new_auth_path));

            this.root_up_to_date = true;
        }
    }

    /**
     * Returns rounded timestamp to the nearest minute in milliseconds.
     */
    private getEpoch = () => {
        const timeNow = new Date();
        timeNow.setSeconds(0);
        timeNow.setMilliseconds(0);

        return timeNow.getTime().toString();
    }

    private generateRandomSignal = () => {
        return Math.random().toString();
    }
}

export default ChatManager