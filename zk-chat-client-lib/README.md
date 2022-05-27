## Client library for anonymous chat using RLN and InterRep

The client library for the zk chat is abstracting away all the functionality for the chat by exposing several methods (part of index.ts) to interact with it. This doc aims to explain how to use this library in a web brower application.


**Note**: You need to install zk-keeper plugin in order to use this library. After installing it, you need to use the following snippet to get the active identity commitment from the plugin:

```
const getActiveIdentity = async () => {
    const { injected } = window as any
    const client = await injected.connect()
    const id = await client.getActiveIdentity(1, 2)
    return id
  }

```

###

You can use that snippet anywhere in the code, but it is required to initialize the library the first time the app is loaded. After you have configured a server available at some endpoint, where the HTTP and Websocket ports are available and ready to accept connections, the first step would be to call the `init` method of the library to initialize the profile.

This method will try to connect to the provided server & socket endpoints (or throw exceptions if connection is not possible), after that it will initialize a new profile and store it in Local Storage using the PROFILE key, and it will register the provided `generateProofCallback` function as a callback to be used by the `send_message` functionality to generate a valid proof by calling the zk-keeper.

**Note**: The `init` method must be called every time the app is loaded/reloaded. However, depending on your page organization, you only need to provide `identityCommitment` during registration, and everytime you call init without the `identityCommitment`, it will try to load the existing profile saved in storage. Providing the `identityCommitment` will generate a new profile and override everything you have in storage.

```
const identityCommitment = await getActiveIdentity()
await init(
{
    SERVER_URL,
    SOCKET_SERVER_URL
},
generateProofCallback,
identityCommitment
)
.then(() => {
    // Perform any redirect action
})
.then(async () => {
    await receive_message(receiveMessageCallback)
})

```

The `generateProofCallback` can be implemented in the following way. Note that your client application **must** expose several public endpoints to load the circuits (rln.wasm & rln_final.zkey). These files are provided as part of the library.

```
export const generateProof = async(nullifier: string, signal: string, storage_artifacts: any, rln_identitifer: string): Promise<any> => {
    const { injected } = window as any
    const client = await injected.connect();
    return await client.rlnProof(
        nullifier,
        signal,
        `${clientUrl}/circuitFiles/rln/rln.wasm`,
        `${clientUrl}/circuitFiles/rln/rln_final.zkey`,
        storage_artifacts,
        rln_identitifer);
}

```

