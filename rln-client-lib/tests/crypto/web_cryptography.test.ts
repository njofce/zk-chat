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

});

export const randomText = (length = 5) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;

};