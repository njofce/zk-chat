
export interface ICryptography {

    generateSymmetricKey: () => Promise<string>;

    generateKeyPair: () => Promise<IKeyPair>;

    generateECDHKeyPair: () => Promise<IKeyPair>;

    deriveSharedSecretKey: (sourcePrivateKey: string, targetPublicKey: string) => Promise<string>;

    encryptMessageSymmetric: (message: string, symmetricKey: string) => Promise<string>;

    decryptMessageSymmetric: (cyphertext: string, symmetricKey: string) => Promise<string>;

    encryptMessageAsymmetric: (message: string, publicKey: string) => Promise<string>;

    decryptMessageAsymmetric: (cyphertext: string, privateKey: string) => Promise<string>;

    hash: (data: string) => string;

}

export interface IKeyPair {
    publicKey: string;
    privateKey: string;
}