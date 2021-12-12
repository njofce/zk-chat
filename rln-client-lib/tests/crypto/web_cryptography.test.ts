import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'
import WebCryptography from '../../src/crypto/web_cryptography';


describe('Test crypto', () => {

    let crypto: WebCryptography;
    
    beforeAll(async () => {
        crypto = new WebCryptography();
    });

    beforeEach(async () => {

    });

    test('generate symmetric key', async () => {
        await crypto.generateSymmetricKey();
        expect(true).toBeTruthy();
    });

    test('encrypt with symmetric key', async () => {
        const data = "some test data";
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

    test('encrypt with asymmetric key', async () => {
        const data = "test message";
        const kp = await crypto.generateKeyPair();

        const cyphertext = await crypto.encryptMessageAsymmetric(data, kp.publicKey);
        const decrypted = await crypto.decryptMessageAsymmetric(cyphertext, kp.privateKey);

        expect(decrypted).toEqual(data);
    });

});