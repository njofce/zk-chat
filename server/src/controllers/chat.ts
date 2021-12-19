import express from "express";
import { chatService } from "../services";

const router = express.Router();

router.get("/chat_history", async (req, res) => {

    try {
        const data = await chatService.getDailyMessages()
        res.status(200).json(data);
    } catch(e) {
        res.status(500).json(e);
    }
});

export default router;