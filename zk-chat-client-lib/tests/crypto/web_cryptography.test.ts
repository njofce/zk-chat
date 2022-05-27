import { IKeyPair } from '../../src/crypto/interfaces';
import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'
import WebCryptography from '../../src/crypto/web_cryptography';
import { v4 as uuidv4 } from 'uuid';
import ProfileManager from '../../src/profile/index';

describe('Test crypto', () => {

    let crypto: WebCryptography;
    
    beforeAll(async () => {
        crypto = new WebCryptography();
    });

    beforeEach(async () => {

    });

    test('generate symmetric key', async () => {
        const symmetric_key: string = await crypto.generateSymmetricKey();
        const size_of_key_in_bytes = Buffer.byteLength(symmetric_key);
        expect(size_of_key_in_bytes).toBeLessThan(128);
        expect(true).toBeTruthy();
    });

    test('encrypt with symmetric key', async () => {
        const data = "some message that is supposed to be long, but not that much."
        const symm_key = await crypto.generateSymmetricKey();
        
        const cyphertext = await crypto.encryptMessageSymmetric(data, symm_key);
        expect(cyphertext).not.toEqual(data);
        const decrypted = await crypto.decryptMessageSymmetric(cyphertext, symm_key);
        expect(decrypted).toEqual(data);
    });

    test('encrypt with symmetric key - another message', async () => {
        const messagesToTest = ["test", "ta", "hi", "hello!", "$# :) emojis", "text and #---123"]

        for (let m in messagesToTest) {
            const symm_key = await crypto.generateSymmetricKey();

            const cyphertext = await crypto.encryptMessageSymmetric(m, symm_key);
            expect(cyphertext).not.toEqual(m);
            const decrypted = await crypto.decryptMessageSymmetric(cyphertext, symm_key);
            expect(decrypted).toEqual(m);
        }
    });

    test('generate asymmetric key', async () => {
        const kp = await crypto.generateKeyPair();
        expect(kp.publicKey).not.toBeNull();
        expect(kp.privateKey).not.toBeNull();
    });

    test('encrypt with asymmetric key - less than max', async () => {
        const data = "some message that is supposed to be long, but not that much."
        const kp = await crypto.generateKeyPair();
        
        const cyphertext = await crypto.encryptMessageAsymmetric(data, kp.publicKey);
        const decrypted = await crypto.decryptMessageAsymmetric(cyphertext, kp.privateKey);

        expect(decrypted).toEqual(data);
    });

    test('encrypt with asymmetric key - more than max, throws exception', async () => {
        let data = "some message that is supposed to be long, but not that much." // length is 60 bytes
        for (let i = 0; i < 10; i++) {
            data += "-" + data;
        }
        const kp = await crypto.generateKeyPair();

        try {
            const cyphertext = await crypto.encryptMessageAsymmetric(data, kp.publicKey);
            const decrypted = await crypto.decryptMessageAsymmetric(cyphertext, kp.privateKey);
            expect(decrypted).toEqual(data);
            expect(true).toBeFalsy();
        } catch(e) {
            expect(true).toBeTruthy();
        }
    });

    test('encrypt with asymmetric key - room invitation, title length less than max', async () => {
        const symm_key = JSON.stringify({ "ext": true, "key_ops": ["encrypt", "decrypt"], "kty": "oct", "alg": "A128GCM", "k": "AoB1wQQx6TncAY66dmIdeg" });
        const room_id = uuidv4();

        const room_title = randomText(ProfileManager.ROOM_NAME_MAX_LENGTH);

        const room_data = JSON.stringify([symm_key, room_id, room_title]);
        const kp = await crypto.generateKeyPair();

        const cyphertext = await crypto.encryptMessageAsymmetric(room_data, kp.publicKey);
        const decrypted = await crypto.decryptMessageAsymmetric(cyphertext, kp.privateKey);
        expect(decrypted).toEqual(room_data);
    });

    test('encrypt with asymmetric key - room invitation, title length bigger than max', async () => {
        const symm_key = JSON.stringify({ "ext": true, "key_ops": ["encrypt", "decrypt"], "kty": "oct", "alg": "A128GCM", "k": "AoB1wQQx6TncAY66dmIdeg" });
        const room_id = uuidv4();
        const room_title = randomText(400);

        const room_data = JSON.stringify([symm_key, room_id, room_title]);
        const kp = await crypto.generateKeyPair();

        try {
            const cyphertext = await crypto.encryptMessageAsymmetric(room_data, kp.publicKey);
            const decrypted = await crypto.decryptMessageAsymmetric(cyphertext, kp.privateKey);
            expect(decrypted).toEqual(room_data);
            expect(true).toBeFalsy();
        } catch(e) {
            expect(true).toBeTruthy();
        }
    });

    test('derive ECDH shared secret', async () => {
        const keyPair1: IKeyPair = await crypto.generateECDHKeyPair();
        const keyPair2: IKeyPair = await crypto.generateECDHKeyPair();

        const derived1 = await crypto.deriveSharedSecretKey(keyPair1.privateKey, keyPair2.publicKey);
        const derived2 = await crypto.deriveSharedSecretKey(keyPair2.privateKey, keyPair1.publicKey);

        expect(derived1).not.toBeNull();
        expect(derived2).not.toBeNull();
        expect(derived1).toEqual(derived2);

        const plaintext = "some text";
        const encryptedWithSharedSecret = await crypto.encryptMessageSymmetric(plaintext, derived1);
        const decryptedWithSharedSecret = await crypto.decryptMessageSymmetric(encryptedWithSharedSecret, derived2);

        expect(decryptedWithSharedSecret).toEqual(plaintext);
    });

    test('hash', async() => {
        const content = "some random data";
        const hash1 = crypto.hash(content);
        const hash2 = crypto.hash(content);

        expect(hash1).toEqual(hash2);
        expect(hash1.length).not.toEqual(0);
        expect(hash2.length).not.toEqual(0);
    });

});

export const randomText = (length = 5) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;

};