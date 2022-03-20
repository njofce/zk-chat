import { LocalStorageProvider } from '../../src/storage/local_storage';
import { IProfile } from '../../src/profile/interfaces';
import { StorageProvider } from '../../src/storage/interfaces';
import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'

describe('Test storage', () => {

    const testProfile: IProfile = {
        rln_identity_commitment: "test_id_commitment_1",
        leaves: ["123", "1234"],
        root_hash: "test",
        user_private_key: "priv",
        user_public_key: "pub",
        rooms: {
            public: [],
            private: [],
            direct: []
        },
        contacts: {}
    }

    let storage: StorageProvider;

    beforeEach(async () => {
        storage = new LocalStorageProvider();
    });

    test('get item - not exists', async () => {
        try {
            await storage.load("test key");
            expect(false).toBeTruthy();
        } catch(e) {
            expect(true).toBeTruthy();
        }
    });

    test('get item - exists', async () => {
        storage.save("test key", "test");
        const retrieved = await storage.load("test key");
        expect(retrieved).toEqual("test");
    });

    test('get item - profile', async () => {
        storage.save("profile", JSON.stringify(testProfile));
        const retrieved = await storage.load("profile");
        expect(JSON.parse(retrieved)).toStrictEqual(testProfile);
    });

});