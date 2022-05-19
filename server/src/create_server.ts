import express from "express";
import { initZKChatServer, ZKServerConfigBuilder } from 'zk-chat-server';

var cors = require("cors");

const createAppServer = () => {

    const config = ZKServerConfigBuilder.get().build()
    initZKChatServer(config);

    const app = express();
    app.use(cors());
    app.options("*", cors());
    
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.send("Chat is healthy");
    });

    return app;
}

export { createAppServer };