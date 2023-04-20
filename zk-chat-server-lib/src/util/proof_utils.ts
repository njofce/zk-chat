import { IShares } from '../persistence/model/request_stats/request_stats.types';
import { RLNFullProof } from "rlnjs";
import Hasher from "./hasher";
import { getYShareFromFullProof } from './types';

export function verifyEpoch(epoch: string, allowedDelay: number): boolean {
    const serverTimestamp = new Date();

    serverTimestamp.setSeconds(Math.floor(serverTimestamp.getSeconds() / 10) * 10);
    serverTimestamp.setMilliseconds(0);
    const messageTimestamp = new Date(parseInt(epoch));

    // Tolerate a difference of EPOCH_ALLOWED_DELAY_THRESHOLD seconds between client and server timestamp
    const difference_in_seconds = Math.abs(serverTimestamp.getTime() - messageTimestamp.getTime()) / 1000;
    if (difference_in_seconds >= allowedDelay)
        return false;

    return true;
}

export async function isZkProofValid(hasher: Hasher, verifierKey: any, proof: RLNFullProof, root: string): Promise<boolean> {
    const actualMerkleRoot = proof.snarkProof.publicSignals.merkleRoot;
    if (BigInt(actualMerkleRoot) != BigInt(root)) {
        console.log(`!@# isZkProofValid: invalid merkle root: actualMerkleRoot=${actualMerkleRoot}, root=${root}`);
        return false;
    }
    const res = await hasher.verifyProof(verifierKey, proof);
    if (!res) {
        console.log("!@# isZkProofValid: invalid proof. verifierKey = ", verifierKey, ", proof = ", proof);
    }
    return res;
}

export function getUserFromShares(zk_proof: RLNFullProof, x_share: string, hasher: Hasher, shares: IShares[]) {
    const sharesX = shares.map((stats) => BigInt(stats.xShare));
    const sharesY = shares.map((stats) => BigInt(stats.yShare));

    sharesX.push(BigInt(x_share));
    sharesY.push(BigInt(getYShareFromFullProof(zk_proof)));
    const secret: bigint = hasher.retrieveSecret(sharesX, sharesY);
    const idCommitment: string = hasher.poseidonHash([secret]).toString();

    return {
        secret: secret,
        idCommitment: idCommitment
    };
}