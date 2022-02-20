import { Strategy, ZkIdentity } from "@zk-kit/identity";
import ChatManager from "./chat";
import { ServerCommunication } from "./communication";
import RLNServerApi from "./communication/api";
import SocketClient from "./communication/ws-socket";
import { ICryptography, IKeyPair } from "./crypto/interfaces";
import ProfileManager from "./profile";
import { StorageProvider } from "./storage/interfaces";

/**
 * A sample class used for independently testing the client library workflow with the server.
 */

class TestStorageProvider implements StorageProvider {

    private data = {}

    constructor() { }

    public async save(key: string, data: string) {
        this.data[key] = data;
    };

    public async load(key: string): Promise<string> {
        const retrievedItem = this.data[key];

        return new Promise((res, rej) => {
            if (retrievedItem)
                res(retrievedItem)
            else
                rej("Requested item was not found");
        })
    };

}

class LocalTestCryptography implements ICryptography {

    generateSymmetricKey = async (): Promise<string> => {
        return (Math.random() * 10000).toString();
    };

    generateKeyPair = async (): Promise<IKeyPair> => {
        const privateKey = Math.random() * 10000;
        const publicKey = (Math.random() * 12345) ^ privateKey;

        return {
            publicKey: publicKey.toString(),
            privateKey: privateKey.toString()
        }
    };

    encryptMessageSymmetric = async (message: string, symmetricKey: string): Promise<string> => {
        return message;
    }

    decryptMessageSymmetric = async (cyphertext: string, symmetricKey: string): Promise<string> => {
        return cyphertext;
    }

    encryptMessageAsymmetric = async (message: string, publicKey: string): Promise<string> => {
        return message;
    };

    decryptMessageAsymmetric = async (cyphertext: string, privateKey: string): Promise<string> => {
        return cyphertext;
    }
}

const comm_manager = new ServerCommunication(new RLNServerApi("http://localhost:8080"), new SocketClient("ws://localhost:8081"));

const cryptography = new LocalTestCryptography();
const storageProvider = new TestStorageProvider();
const profile = new ProfileManager(storageProvider, cryptography);

const chat = new ChatManager(profile, comm_manager, cryptography);

const main = async () => {
    let zkIdentity: ZkIdentity = new ZkIdentity(Strategy.SERIALIZED ,`{
        "identityNullifier":"9dd8ec97c78ec5c26fee7791e6ecca93f68fae7d9b5a050c12dfda6181bc88",
        "identityTrapdoor":"f064ac44608d02370c8f2942d048ac040ccedd241907e0297f50279d9621d5",
        "secret":["9dd8ec97c78ec5c26fee7791e6ecca93f68fae7d9b5a050c12dfda6181bc88", "f064ac44608d02370c8f2942d048ac040ccedd241907e0297f50279d9621d5"]
    }`);
 
    const idCommitment: BigInt = zkIdentity.genIdentityCommitment();
    
    const id_commitment = idCommitment.toString();
    await profile.initProfile(
        id_commitment,
        "17653365708849444179865362482568296819146357340229089950066221313927057063266",
        await comm_manager.getLeaves()
    );

    comm_manager.receiveMessage(messageHandler);

    profile.addDirectRoom({
        id: "test-1",
        name: "direct room 1",
        type: "PUBLIC",
        symmetric_key: "some other key",
        recipient_public_key: "some key"
    })

    await chat.sendMessage("test-1", "This is a raw test message", async (nullifier: string, signal: string, storage_artifacts: any, rln_identitifer: any) => {
        return {
            proof: {
                pi_a: [],
                pi_b: [],
                pi_c: [],
                protocol: "",
                curve: ""
            },
            publicSignals: []
        };
    });

    while(true)
        await sleep();
}

const messageHandler = message => {
    console.log("Handling some message that is being broadcast", message);
}

const sleep = async (intervalSeconds: number = 15) => {
    await new Promise((r) => setTimeout(r, intervalSeconds * 1000));
};
main().then(() => {
    console.log("complete");
});
