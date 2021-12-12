import { ICryptography, IKeyPair } from './interfaces'

const ab2str = require('arraybuffer-to-string');
const str2ab = require('string-to-arraybuffer');

/**
 * Provides basic cryptographical primitives using the Web Crypto API.
 */
class WebCryptography implements ICryptography {

    constructor() {
        if (!window)
            throw "This module is intended to work only in the browser";
    }

    public generateSymmetricKey = async(): Promise<string> => {

        const key = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256
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
    
    public generateKeyPair = async (): Promise<IKeyPair> => {
        let keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
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
                publicKey: ab2str(exportedPublicKey, "base64"),
                privateKey: ab2str(exportedPrivateKey, "base64")
            }
        }
        throw "Could not generate key pairs";
    }

    public encryptMessageSymmetric = async (message: string, symmetricKey: string): Promise<string> => {
        const importedSymmetricKey = await window.crypto.subtle.importKey(
            "jwk",
            JSON.parse(symmetricKey),
            "AES-GCM",
            true,
            ['encrypt', 'decrypt']);

        const iv_substring = symmetricKey.substr(0, 10);

        const encrypted: ArrayBuffer = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: str2ab(iv_substring)
            }, 
            importedSymmetricKey, 
            str2ab(message, "utf-8"));

        return ab2str(encrypted, "base64");
    }

    public decryptMessageSymmetric = async (cyphertext: string, symmetricKey: string): Promise<string> => {
        const importedSymmetricKey = await window.crypto.subtle.importKey(
            "jwk",
            JSON.parse(symmetricKey),
            "AES-GCM",
            true,
            ['encrypt', 'decrypt']);

        const iv_substring = symmetricKey.substr(0, 10);

        const decrypted: ArrayBuffer = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: str2ab(iv_substring, "utf-8")
            },
            importedSymmetricKey,
            str2ab(cyphertext));

        return ab2str(decrypted);
    }

    public encryptMessageAsymmetric = async (message: string, publicKey: string): Promise<string> => {
        const importedPublicKey = await window.crypto.subtle.importKey(
            "spki",
            str2ab(publicKey), 
            { name: "RSA-OAEP", hash: "SHA-256" },
            true, 
            ['encrypt']);

        const encryptedBytes: ArrayBuffer = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            importedPublicKey,
            str2ab(message)
        );

        return ab2str(encryptedBytes, "base64");
    }
    
    public decryptMessageAsymmetric = async (cyphertext: string, privateKey: string): Promise<string> => {
        const importedPrivateKey = await window.crypto.subtle.importKey(
            "pkcs8",
            str2ab(privateKey),
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ['decrypt']);

        const decryptedBytes: ArrayBuffer = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            importedPrivateKey,
            str2ab(cyphertext)
        );

        return ab2str(decryptedBytes);
    }
}

export default WebCryptography;