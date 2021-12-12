import { ZkIdentity } from "@libsem/identity";
import ChatManager from "./chat";
import { ServerCommunication } from "./communication";
import RLNServerApi from "./communication/api";
import SocketClient from "./communication/ws-socket";
import { ICryptography, IKeyPair } from "./crypto/interfaces";
import ProfileManager from "./profile";
import { StorageProvider } from "./storage/interfaces";

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

const comm_manager = new ServerCommunication(new RLNServerApi("http://localhost:3000"), new SocketClient("ws://localhost:3001"));

const cryptography = new LocalTestCryptography();
const storageProvider = new TestStorageProvider();
const profile = new ProfileManager(storageProvider, cryptography);

const chat = new ChatManager(profile, comm_manager, cryptography);

const main = async () => {
    let zkIdentity: ZkIdentity = ZkIdentity.genFromSerialized(`{
        "identityNullifier":"9dd8ec97c78ec5c26fee7791e6ecca93f68fae7d9b5a050c12dfda6181bc88",
        "identityTrapdoor":"f064ac44608d02370c8f2942d048ac040ccedd241907e0297f50279d9621d5",
        "secret":[
            "a56102e45e6232e9ed26face75e0ff4e0579d9c0d3ab14e3951919f486038f",
            "f658aebab17a5c7843a82270562a6cf50cd96d8b34a85b5804ec65b6333a39",
            "b126e4885dc4beb994d70d837889591c7d62dcd0e78597af3ff8e6bede7164",
            "f4798c7d87eba54d305ff674fc4e13e159b524c72462a273050551f7e86e27",
            "db011e11fc9bb84408cc3b18aebed12fb07732a23e1721071c2c60d7c71189",
            "e6004f0577c1cd5eb9baa81ded51c4498b2052fd3557c52534da4d701e1929",
            "81b55f5f730811dfa0876d0957bcf7cd1fe45c50dd20326dcfcfb08f670152",
            "5c719d0d275a808af23fe878e4ae6c505ac594cb9ae551c2198b01e9173445",
            "679319f523bd2eb6b5f07ef4859bc73765bde093f7a28bba3a3095f0bd4be",
            "7a8e2772c93bf114460fede8a0fe7d72521d99ae9cd92ebb563d1753a18cd1"
        ]}`);
 
    const idSecret: bigint[] = zkIdentity.getSecret();
    const idCommitment: BigInt = zkIdentity.genIdentityCommitmentFromSecret();
    
    const id_commitment = idCommitment.toString();
    await profile.initProfile(
        id_commitment,
        idSecret.map(b => b.toString()),
        "17653365708849444179865362482568296819146357340229089950066221313927057063266",
        JSON.stringify(await comm_manager.getUserAuthPath(id_commitment))
    );

    comm_manager.receiveMessage(messageHandler);

    profile.addDirectRoom({
        id: "test-1",
        name: "direct room 1",
        type: "PUBLIC",
        recepient_public_key: "some key"
    })

    await chat.sendMessage("test-1", "This is a raw test message");

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
