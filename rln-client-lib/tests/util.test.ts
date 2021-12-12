import { jest, test, expect, describe, beforeAll, beforeEach } from '@jest/globals'
import { deepClone, groupBy } from '../src/util'

describe('Util test', () => {

    beforeEach(async () => {
        
    });

    test('deep clone', async () => {
        const data = { 
            "key": "value",
            "nested": {
                "1": "test 1"
            }
        };
        const cloned = deepClone(data);
        expect(cloned).toStrictEqual(data);
    });

    test('group by', async () => {
        const grouppedBy = groupBy(
            [
                {
                    "key1": "test1",
                    "key2": "value1"
                },
                {
                    "key1": "test1",
                    "key2": "value2"
                },
                {
                    "key1": "test2",
                    "key2": "value3"
                },
                {
                    "key1": "test3",
                    "key2": "value4"
                }
            ],
            "key1")
        expect(grouppedBy).toStrictEqual(
            { 
                "test1": [{ "key1": "test1", "key2": "value1" }, { "key1": "test1", "key2": "value2" }], 
                "test2": [{ "key1": "test2", "key2": "value3" }], 
                "test3": [{ "key1": "test3", "key2": "value4" }] 
            }
        );
    });


});