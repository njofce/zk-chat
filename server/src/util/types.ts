/**
 * The message that each client sends to the server
 */

export interface RLNMessage {
    zk_proof: string;
    nullifier: string;
    epoch: string;
    xShare: string;
    yShare: string;
    chat_type: string;
    message_content: string;
}

export const constructRLNMessage = (parsedJson: any): RLNMessage => {
    const keys: string[] = Object.keys(parsedJson);
    
    if (keys.length != 7)
        throw "Bad message";

    const interfaceKeys: string[] = [
        "zk_proof", "nullifier", "epoch", "xShare", "yShare", "chat_type", "message_content"
    ];

    for (let iK of interfaceKeys) {
        if (keys.indexOf(iK) == -1) {
            console.log("key does not exist ", iK);
            throw "Bad message";
        }
    }
    
    return {
        zk_proof: parsedJson.zk_proof,
        nullifier: parsedJson.nullifier,
        epoch: parsedJson.epoch,
        xShare: parsedJson.xShare,
        yShare: parsedJson.yShare,
        chat_type: parsedJson.chat_type,
        message_content: parsedJson.message_content
    }
}