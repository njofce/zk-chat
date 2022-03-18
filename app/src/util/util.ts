import { clientUrl } from "../constants/constants";

/**
 * A callback function to generate RLN proof using the ZK-keeper plugin.
 */
export const generateProof = async(nullifier: string, signal: string, storage_artifacts: any, rln_identitifer: string): Promise<any> => {
    const { injected } = window as any
    const client = await injected.connect();
    return await client.rlnProof(
        nullifier,
        signal,
        `${clientUrl}/circuitFiles/rln/rln.wasm`,
        `${clientUrl}/circuitFiles/rln/rln_final.zkey`,
        storage_artifacts,
        rln_identitifer);
}