import { FullProof } from '@zk-kit/protocols';

/**
 * The message that each client sends to the server
 */
export interface RLNMessage {
    zk_proof: FullProof;
    x_share: string;
    epoch: string;
    chat_type: string;
    message_content: string;
}

export const constructRLNMessage = (parsedJson: any): RLNMessage => {
    const keys: string[] = Object.keys(parsedJson);
    
    if (keys.length != 5)
        throw "Bad message";

    const interfaceKeys: string[] = [
        "zk_proof", "x_share", "epoch", "chat_type", "message_content"
    ];

    for (let iK of interfaceKeys) {
        if (keys.indexOf(iK) == -1) {
            console.log("key does not exist ", iK);
            throw "Bad message";
        }
    }
    
    return {
        zk_proof: parsedJson.zk_proof,
        x_share: parsedJson.x_share,
        epoch: parsedJson.epoch,
        chat_type: parsedJson.chat_type,
        message_content: parsedJson.message_content
    }
}

export const getNullifierFromFullProof = (proof: FullProof): string => {
    return proof.publicSignals[2].toString();
}

export const getYShareFromFullProof = (proof: FullProof): string => {
    return proof.publicSignals[0].toString();
}