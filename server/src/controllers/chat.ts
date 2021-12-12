import express from "express";
import { body, validationResult } from 'express-validator';
import { chatService } from "../services";

const router = express.Router();

router.post("/chat_history", 
    body('room_ids').notEmpty(),
    async (req, res) => {

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(500).json({ errors: errors.array() });
    }

    try {
        const data = await chatService.getDailyMessages(req.body.room_ids)
        res.status(200).json(data);
    } catch(e) {
        res.status(500).json(e);
    }
});

export default router;