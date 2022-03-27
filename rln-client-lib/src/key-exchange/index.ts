import ChatManager, { IProofData } from "../chat";
import { ServerCommunication } from "../communication";
import { ICryptography } from "../crypto/interfaces";
import ProfileManager from "../profile";
import { IKeyExchangeEnabledRoom } from "../room/interfaces";

/**
 * The component that manages the spam-resistant key exchange protocol.
 * 
 * On startup, a task is scheduled to run the key-exchange protocol every X seconds. The key exchange protocol is ran for all the rooms that
 * support DH key exchange.
 */
class KeyExchangeManager {

    private static KEY_EXCHANGE_SCHEDULED_TASK_INTERVAL_MS = 30000;

    private communication: ServerCommunication;
    private cryptography: ICryptography;
    private chatManager: ChatManager;
    private profileManager: ProfileManager;
    private proofGeneratorCallback: (nullifier: string, signal: string, storage_artifacts: any, rln_identitifer: any) => Promise<any>;

    constructor(communication: ServerCommunication, cryptography: ICryptography, chatManager: ChatManager, profileManager: ProfileManager, proofGeneratorCallback: (nullifier: string, signal: string, storage_artifacts: any, rln_identitifer: any) => Promise<any>) {
        this.communication = communication;
        this.cryptography = cryptography;
        this.chatManager = chatManager;
        this.profileManager = profileManager;
        this.proofGeneratorCallback = proofGeneratorCallback;
    }

    public init() {
        this.scheduleKeyExchangeProtocol();
    }

    private scheduleKeyExchangeProtocol() {
        setInterval(async() => {
            const rooms: IKeyExchangeEnabledRoom[] = this.profileManager.getAllRoomsAvailableForKeyExchange();
            await this.runKeyExchangeProtocol(rooms)
        }, KeyExchangeManager.KEY_EXCHANGE_SCHEDULED_TASK_INTERVAL_MS);
    }

    /**
     * Generates and posts a key bundle to the server. 
     * 
     * The key bundle includes an encrypted content, which includes the provided DH key exchange public key and the sender public key.
     * The encrypted content is encrypted with a symmetric key, which then gets encrypted with the receiver's public key.
     * 
     * The bundle is saved the server, and it can't be linked to the sender in any way.
     * 
     * @param dhPublicKey 
     * @param receiverPublicKey 
     */
    public async saveKeyExchangeBundle(dhPublicKey: string, receiverPublicKey: string) {
        const userPublicKey = await this.profileManager.getPublicKey();

        const keyExchangeContent: IKeyExchangeContent = {
            dh_public_key: dhPublicKey,
            sender_public_key: userPublicKey
        };

        const symmetricKey: string = await this.cryptography.generateSymmetricKey();

        const stringifiedContent: string = JSON.stringify(keyExchangeContent);
        const encryptedContentWithSymmetricKey: string = await this.cryptography.encryptMessageSymmetric(stringifiedContent, symmetricKey);
        const encryptedSymmetricKey: string = await this.cryptography.encryptMessageAsymmetric(symmetricKey, receiverPublicKey);
        const contentHash: string = this.cryptography.hash(stringifiedContent);
        const proofData: IProofData = await this.chatManager.generateProof(this.proofGeneratorCallback);

        await this.communication.saveKeyExchangeBundle(
            proofData.fullProof,
            proofData.epoch,
            proofData.xShare,
            encryptedContentWithSymmetricKey,
            contentHash,
            encryptedSymmetricKey,
            receiverPublicKey);
    }

    /**
     * Runs the automatic key exchange algorithm for all the provided rooms which support key exchange.
     * 
     * @param rooms the rooms which support DH key exchange.
     */
    private async runKeyExchangeProtocol(rooms: IKeyExchangeEnabledRoom[]) {
        const userPublicKey = await this.profileManager.getPublicKey();
        const userPrivateKey = await this.profileManager.getPrivateKey();

        try {
            const bundlesIntendedForCurrentUser: any[] = await this.communication.getKeyExchangeBundles(userPublicKey);
        
            let bundlesToDeleteFromServer: any[] = []
            for (let bundleIntendedForCurrentUser of bundlesIntendedForCurrentUser) {
                
                try {
                    const encryptedContentString = bundleIntendedForCurrentUser.encrypted_content;
                    const encryptedSymmetricKey = bundleIntendedForCurrentUser.encrypted_key;
                    const decryptedSymmetricKey = await this.cryptography.decryptMessageAsymmetric(encryptedSymmetricKey, userPrivateKey);
                    const decryptedContentString = await this.cryptography.decryptMessageSymmetric(encryptedContentString, decryptedSymmetricKey);
                    const decryptedContentObject: IKeyExchangeContent = JSON.parse(decryptedContentString);
                    const contentHash: string = this.cryptography.hash(decryptedContentString);

                    const room = rooms.find(r => r.recipient_public_key == decryptedContentObject.sender_public_key)

                    if (room != undefined) {
                        // Derive key
                        this.profileManager.deriveRoomSecretKey(room, decryptedContentObject.dh_public_key);

                        // Mark bundle for deletion
                        bundlesToDeleteFromServer.push({
                            content_hash: contentHash,
                            receiver_public_key: userPublicKey
                        })
                    }
                } catch(e) {
                    console.log("Error while handling the key exchange bundle", e);
                }
            }

            // Delete bundles
            if (bundlesToDeleteFromServer.length > 0) {
                const newProofData: IProofData = await this.chatManager.generateProof(this.proofGeneratorCallback);
                await this.communication.deleteKeyExchangeBundles(newProofData.fullProof, newProofData.epoch, newProofData.xShare, bundlesToDeleteFromServer);
            }
        } catch(e) {
            console.log("error while running key exchange protocol", e);
        }
    }

}

export interface IKeyExchangeContent {
    dh_public_key: string;
    sender_public_key: string;
}

export default KeyExchangeManager;