## Server library for anonymous chat using RLN and InterRep

You can install this library in any existing server, though you need to make sure to allocate 2 specific ports for HTTP and Websocket communication. 

Use the following snippet to initialize the server library, using the default configuration.

```
import { initZKChatServer, ZKServerConfigBuilder } from 'zk-chat-server';

const config = ZKServerConfigBuilder.get().build()
initZKChatServer(config);

```

The default configuration is given below, which you can easily configure by overriding the builder configs.

```

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

```