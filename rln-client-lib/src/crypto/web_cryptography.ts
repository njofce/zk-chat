import { ICryptography, IKeyPair } from './interfaces'

/**
 * Provides basic cryptographical primitives using the Web Crypto API.
 */
class WebCryptography implements ICryptography {

    public static AES_KEY_LENGTH: number = 128;

    /**
     * THe maximum length of content that can be encrypted with RSA-OAEP used will be (4096/8) - 42 bytes.
     */
    public static RSA_MODULUS_LENGTH: number = 4096;

    constructor() {
        if (!window)
            throw "This module is intended to work only in the browser";
    }

    /**
     * Generates AES-GCM symmetric key with AES_KEY_LENGTH bytes.
     */
    public async generateSymmetricKey(): Promise<string> {

        const key = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: WebCryptography.AES_KEY_LENGTH
            },
            true,
            ["encrypt", "decrypt"]
        );

        if (key) {
            const raw: JsonWebKey = await crypto.subtle.exportKey(
                "jwk",
                key,
            );
            return JSON.stringify(raw);
        }
        throw "Could not generate symmetric key";
    }
    
    /**
     * Generates a RSA key pair with a modulus of RSA_MODULUS_LENGTH
     */
    public async generateKeyPair(): Promise<IKeyPair> {
        let keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: WebCryptography.RSA_MODULUS_LENGTH,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );

        if (keyPair.publicKey && keyPair.privateKey) {
            
            const exportedPublicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
            const exportedPrivateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

            return {
                publicKey: this.ab2str(exportedPublicKey),
                privateKey: this.ab2str(exportedPrivateKey)
            }
        }
        throw "Could not generate key pairs";
    }

    /**
     * Encrypts a message using a provided symmetric key.
     * Throws an exception if the key is invalid
     */
    public async encryptMessageSymmetric(message: string, symmetricKey: string): Promise<string> {
        const importedSymmetricKey = await window.crypto.subtle.importKey(
            "jwk",
            JSON.parse(symmetricKey),
            "AES-GCM",
            true,
            ['encrypt', 'decrypt']);

        const iv_substring = symmetricKey.substring(0, 10);

        
        const encrypted: ArrayBuffer = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: this.str2ab(iv_substring)
            }, 
            importedSymmetricKey, 
            this.str2ab(message));

        return this.ab2str(encrypted);
    }

    /**
     * Decrypts a message using a provided symmetric key.
     * Throws an exception if the key is invalid
     */
    public async decryptMessageSymmetric(cyphertext: string, symmetricKey: string): Promise<string> {
        const importedSymmetricKey = await window.crypto.subtle.importKey(
            "jwk",
            JSON.parse(symmetricKey),
            "AES-GCM",
            true,
            ['encrypt', 'decrypt']);

        const iv_substring = symmetricKey.substring(0, 10);

        const decrypted: ArrayBuffer = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: this.str2ab(iv_substring)
            },
            importedSymmetricKey,
            this.str2ab(cyphertext));

        return this.ab2str(decrypted);
    }

    /**
     * Encrypts a message using a provided public key.
     * Throws an exception if the key is invalid.
     * Throws an exception if the message length is longer than the supported length, mentioned above.
     */
    public async encryptMessageAsymmetric(message: string, publicKey: string): Promise<string> {
        const importedPublicKey = await window.crypto.subtle.importKey(
            "spki",
            this.str2ab(publicKey), 
            { name: "RSA-OAEP", hash: "SHA-256" },
            true, 
            ['encrypt']);

        const encryptedBytes: ArrayBuffer = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            importedPublicKey,
            this.str2ab(message)
        );

        return this.ab2str(encryptedBytes);
    }
    
    /**
     * Decrypts a message using a provided public key.
     * Throws an exception if the key is invalid.
     */
    public async decryptMessageAsymmetric(cyphertext: string, privateKey: string): Promise<string> {
        const importedPrivateKey = await window.crypto.subtle.importKey(
            "pkcs8",
            this.str2ab(privateKey),
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ['decrypt']);

        const decryptedBytes: ArrayBuffer = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            importedPrivateKey,
            this.str2ab(cyphertext)
        );

        return this.ab2str(decryptedBytes);
    }

    /**
     * Converts an array buffer to a string.
     */
    private ab2str(buf: ArrayBuffer) {
        //@ts-ignore
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    /**
     * Converts a string to an array buffer.
     */
    private str2ab(str) {
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }
}

export default WebCryptography;