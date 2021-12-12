import express from "express";
import { chatRouter, roomRouter, userRouter } from "./controllers";

const createServer = () => {

    const app = express();
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.send("Chat is healthy");
    });

    app.use("/api/v1/chat", chatRouter);
    app.use("/api/v1/user", userRouter);
    app.use("/api/v1/public_room", roomRouter);


    return app;
}

export {createServer};