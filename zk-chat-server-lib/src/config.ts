import { IZKServerConfig } from "./types";

export class ZKServerConfigBuilder {

    serverConfig: IZKServerConfig = {
        interepUrl: "https://kovan.interep.link/api/v1",
        redisHostname: "localhost",
        redisPort: 6379,
        redisPassword: "password",
        redisChannel: "nodeSync",
        dnConnectionString: "mongodb://localhost:27017",
        serverPort: 8080,
        socketServerPort: 8081,
        merkleTreeLevels: 15,
        spamThreshold: 2,
        epochAllowedDelayThreshold: 20,
        interepSyncIntervalSeconds: 300,
        zeroValue: BigInt(0),
        rlnIdentifier: 518137101,
        messagesChannel: "messages",
        messagesBroadcast: "message-broadcast",
        updatesChannel: "updates",
        deleteMessagesOlderThanDays: 5
    }

    public static get() {
        return new ZKServerConfigBuilder();
    }

    public build(): IZKServerConfig {
        return this.serverConfig;
    }

    public interepUrl(url: string): ZKServerConfigBuilder {
        this.serverConfig.interepUrl = url;
        return this;
    }
    
    public redisHostname(hostname: string): ZKServerConfigBuilder {
        this.serverConfig.redisHostname = hostname;
        return this;
    }

    public redisPort(port: number): ZKServerConfigBuilder {
        this.serverConfig.redisPort = port;
        return this;
    }

    public redisPassword(password: string): ZKServerConfigBuilder {
        this.serverConfig.redisPassword = password;
        return this;
    }

    public redisChannel(channel: string): ZKServerConfigBuilder {
        this.serverConfig.redisChannel = channel;
        return this;
    }

    public dnConnectionString(connectionString: string): ZKServerConfigBuilder {
        this.serverConfig.dnConnectionString = connectionString;
        return this;
    }

    public serverPort(port: number): ZKServerConfigBuilder {
        this.serverConfig.serverPort = port;
        return this;
    }

    public socketServerPort(port: number): ZKServerConfigBuilder {
        this.serverConfig.socketServerPort = port;
        return this;
    }

    public merkleTreeLevels(levels: number): ZKServerConfigBuilder {
        this.serverConfig.merkleTreeLevels = levels;
        return this;
    }

    public spamThreshold(threshold: number): ZKServerConfigBuilder {
        this.serverConfig.spamThreshold = threshold;
        return this;
    }

    public epochAllowedDelayThreshold(epochAllowedDelayThreshold: number): ZKServerConfigBuilder {
        this.serverConfig.epochAllowedDelayThreshold = epochAllowedDelayThreshold;
        return this;
    }

    public interepSyncIntervalSeconds(interepSyncIntervalSeconds: number): ZKServerConfigBuilder {
        this.serverConfig.interepSyncIntervalSeconds = interepSyncIntervalSeconds;
        return this;
    }

    public zeroValue(zeroValue: bigint): ZKServerConfigBuilder {
        this.serverConfig.zeroValue = zeroValue;
        return this;
    }

    public rlnIdentifier(rlnIdentifier: number): ZKServerConfigBuilder {
        this.serverConfig.rlnIdentifier = rlnIdentifier;
        return this;
    }

    public messagesChannel(messagesChannel: string): ZKServerConfigBuilder {
        this.serverConfig.messagesChannel = messagesChannel;
        return this;
    }

    public messagesBroadcast(messagesBroadcast: string): ZKServerConfigBuilder {
        this.serverConfig.messagesBroadcast = messagesBroadcast;
        return this;
    }

    public updatesChannel(updatesChannel: string): ZKServerConfigBuilder {
        this.serverConfig.updatesChannel = updatesChannel;
        return this;
    }

    public deleteMessagesOlderThanDays(deleteMessagesOlderThanDays: number): ZKServerConfigBuilder {
        this.serverConfig.deleteMessagesOlderThanDays = deleteMessagesOlderThanDays;
        return this;
    }
}