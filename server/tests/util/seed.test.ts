import { clearDatabase } from '../jest.setup';
import { test, expect, describe, afterEach } from '@jest/globals'

import { seedZeros } from "../../src/util/seed";
import { MerkleTreeZero } from '../../src/persistence/model/merkle_tree/merkle_tree.model';
import { IMerkleTreeZero } from '../../src/persistence/model/merkle_tree/merkle_tree.types';

describe('Test seed', () => {

    afterEach(async () => {
        await clearDatabase();
    })

    test('seed zeros - empty', async () => {
        await seedZeros(BigInt(0));

        const zeros: IMerkleTreeZero[] = await MerkleTreeZero.findZeros();

        expect(zeros.length).toEqual(15);
    });

    test('seed zeros - already seeded', async () => {
        await seedZeros(BigInt(0));
        let zeros: IMerkleTreeZero[] = await MerkleTreeZero.findZeros();
        expect(zeros.length).toEqual(15);


        // seed again
        await seedZeros(BigInt(0));
        zeros = await MerkleTreeZero.findZeros();
        expect(zeros.length).toEqual(15);
        expect(zeros[0].hash).toEqual("0");
        expect(zeros[0].hash).toEqual("0");
    });


});
