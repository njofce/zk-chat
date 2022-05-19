export type IZKServerConfig = {
    interepUrl: string;
    redisHostname: string;
    redisPort: number;
    redisPassword: string;
    redisChannel: string;
    dnConnectionString: string;
    serverPort: number;
    socketServerPort: number;
    merkleTreeLevels: number;
    spamThreshold: number;
    epochAllowedDelayThreshold: number;
    interepSyncIntervalSeconds: number;
    zeroValue: bigint;
    rlnIdentifier: number;
    messagesChannel: string;
    messagesBroadcast: string;
    updatesChannel: string;
    deleteMessagesOlderThanDays: number;
}