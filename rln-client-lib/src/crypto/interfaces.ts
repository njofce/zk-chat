
export interface ICryptography {

    generateSymmetricKey: () => Promise<string>;

    generateKeyPair: () => Promise<IKeyPair>;

    encryptMessageSymmetric: (message: string, symmetricKey: string) => Promise<string>;

    decryptMessageSymmetric: (cyphertext: string, symmetricKey: string) => Promise<string>;

    encryptMessageAsymmetric: (message: string, publicKey: string) => Promise<string>;

    decryptMessageAsymmetric: (cyphertext: string, privateKey: string) => Promise<string>;

}

export interface IKeyPair {
    publicKey: string;
    privateKey: string;
}