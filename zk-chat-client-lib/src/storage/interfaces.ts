export interface StorageProvider { 
    save: (key: string, data: string) => void;
    load: (key: string) => Promise<string>;
}