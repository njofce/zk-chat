import express from "express";
import { chatRouter, roomRouter, userRouter, keyExchangeRouter } from "./controllers";

var cors = require("cors");

const createServer = () => {

    const app = express();
    app.use(cors());
    app.options("*", cors());
    
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.send("Chat is healthy");
    });

    app.use("/api/v1/chat", chatRouter);
    app.use("/api/v1/user", userRouter);
    app.use("/api/v1/public_room", roomRouter);
    app.use("/api/v1/key_exchange", keyExchangeRouter);


    return app;
}

export {createServer};