<p align="center">
    <h1 align="center">
        RLN Anonymous Chat
    </h1>
    <p align="center">Anonymous instant chat application using RLN</p>
</p>

A spam resistant instant messaging application for private and anonymous communication. It has the following general properties:

- **Spam Resistance**: members of all sorts of chat rooms will be removed if they spam the communication channel.
- **Anonymity**: the members within the chat room can only know the content of the messages, but they can't know the message sender (the publisher). The users of the application have total control over their private data (ex. identity, encryption keys, chat rooms they are part of) and it's not shared with anyone. The identity of a user is revealed only when spamming the communication channel.
- **Privacy**: only the members within a chat can view the content of the messages designated for that chat - members outside of the chat can't view the message content.

However, there are a few use cases where not all properties will hold, since the general functionality of the chat is to support different types of rooms - public, private and 1-1 rooms. The anonymity property doesn't apply to the 1-1 chat rooms, while the privacy property doesn't apply to the public chat rooms. On the other hand, the spam resistance applies to all types of chat rooms, as the key property of the entire application.

To prevent the spamming problem, social reputation is used as a collateral by using the InterRep architecture for linking a social network profile with the user credentials (identity commitment). This kind of bonding enables few security properties:

- It enables strong anti spam measures as the spammer's identity commitment will be revealed and will be banned from the application.
- Sybil-attack possibilities are drastically reduced because the user needs to own a reputable social media account, which means they can't easily register themselves multiple times.



The full technical specification for this project can be found at (this url)[https://www.notion.so/njofce/Technical-Specification-6649797a76ed4858933015360fc76650]

## Steps to run locally

In order to run the application locally, you need to have installed Docker and docker-compose. 
1. Run `docker-compose up -d` in order to spin up Redis and Mongo DB
2. Install `tsc` and `react-scripts` globally.
3. For `app` and `server` projects, copy `.env.example` to `.env` and modify the values to your choice. Default values should work fine.
4. Run `yarn install`
5. Run `yarn build`
6. Run `yarn server` in a terminal
7. Run `yarn app` in another terminal