import { IShares } from '../persistence/model/request_stats/request_stats.types';
import { RLNFullProof } from "rlnjs";
import Hasher from "./hasher";
import { getYShareFromFullProof } from './types';


// TODO: Should be in config?
const SECONDS_PER_EPOCH = 10;

export function verifyEpoch(epoch: string, allowedDelay: number): boolean {
    const millisecondsPerEpoch = SECONDS_PER_EPOCH * 1000;
    const serverEpoch = BigInt(Math.floor(Date.now() / millisecondsPerEpoch) * millisecondsPerEpoch);
    const messageEpoch = BigInt(epoch);

    // Tolerate a difference of EPOCH_ALLOWED_DELAY_THRESHOLD seconds between client and server timestamp
    const difference_in_seconds = Math.abs(Number(serverEpoch - messageEpoch)) / 1000;
    console.log(`!@# verifyEpoch: serverEpoch=${serverEpoch}, messageEpoch=${messageEpoch}, difference_in_seconds=${difference_in_seconds}, allowedDelay=${allowedDelay}`)
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