import express from "express";
import { body, validationResult } from 'express-validator';
import { chatService } from "../services";

const router = express.Router();

/**
* @deprecated use the endpoint to get messages by time range
*/
router.get("/chat_history", async (req, res) => {

    try {
        const data = await chatService.getDailyMessages()
        res.status(200).json(data);
    } catch(e) {
        res.status(500).json(e);
    }
});

router.post("/time_range_chat_history", 
    body('from').notEmpty(),
    body('to').notEmpty(),
    async (req, res) => {

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ errors: errors.array() });
        }

        try {
            const fromTimestamp = new Date(req.body.from)
            const toTimestamp = new Date(req.body.to)
            const data = await chatService.getMessagesInTimeRange(fromTimestamp, toTimestamp)
            res.status(200).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).json(e);
        }
});

export default router;