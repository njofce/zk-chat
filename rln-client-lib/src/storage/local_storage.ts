import { StorageProvider } from './interfaces';

export class LocalStorageProvider implements StorageProvider {

    constructor() { }

    public async save(key: string, data: string) {
        localStorage.setItem(key, data);
    };

    public async load(key: string): Promise<string> {
        const retrievedItem = localStorage.getItem(key);

        return new Promise((res, rej) => {
            if (retrievedItem)
                res(retrievedItem)
            else
                rej("Requested item was not found");
        })
    };

}