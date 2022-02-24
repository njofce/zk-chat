import { RLNFullProof } from '@zk-kit/protocols';
import { beforeAll, afterAll } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Hasher from '../src/util/hasher';

let mongo: MongoMemoryServer;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();

    const url = mongo.getUri();
    await mongoose.connect(url, { useNewUrlParser: true });

});

afterAll(async() => {
    await mongoose.connection.close()
    await mongo.stop();
})

// Utility method to clear the entire Mongo DB
export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
}


// Mock redis
jest.mock('redis', () => jest.requireActual('redis-mock'));


/**
 * When running tests with jest, there's an issue with circomlibjs dependencies, related to ethereum utils.
 * Mocking that here with a deterministic mock for posseidon hasher.
 */
jest.mock("../src/util/hasher", () => {
    return jest.fn().mockImplementation(() => {
        return {
            poseidonHash: (data: BigInt[]) => {
                const result = data[0].valueOf() + data[1].valueOf() + BigInt(120).valueOf();
                return BigInt(result);
            },
            genExternalNullifier: (data: string): string => {
                return data; // always return the same
            },
            verifyProof: async (verifierKey: any, proof: RLNFullProof) => {
                return false;
            },
            retrieveSecret: (sharesX: bigint[], sharesY: bigint[]): bigint => {
                return BigInt(123455);
            },
            generateMerkleProof: (leaves: string[], targetLeaf: string) => {
                return {
                    root: "root",
                    leaf: "abc",
                    siblings: [1, 2],
                    pathIndices: [1, 2]
                };
            }
        }
    });
})