import express from "express";
import { body, validationResult } from 'express-validator';
import { publicRoomService } from "../services";

const router = express.Router();

router.post("/", 
    body('uuid').notEmpty(),
    body('name').notEmpty(),
    body('symmetric_key').notEmpty(),
    async (req, res) => {

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(500).json({ errors: errors.array() });
    }

    try {
        await publicRoomService.saveRoom(req.body.uuid, req.body.name, req.body.symmetric_key);
        res.status(204).json("success");
    } catch(e) {
        res.status(500).json("Unknown error while creating a public room!");
    }
});

router.get("/all", async (req, res) => {

    const all_rooms = await publicRoomService.getAllRooms();

    res.status(200).json(all_rooms);
});

router.get("/one/:room_id", async (req, res) => {
    const room = await publicRoomService.findRoomById(req.params.room_id);
    if (room == null) {
        res.status(404).json(null);
    } else {
        res.status(200).json(room);
    }
});

export default router;