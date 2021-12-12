import express from "express";
import { body, validationResult } from 'express-validator';
import { userService } from "../services";
const router = express.Router();

router.get("/rln_root", async (req, res) => {
    try {
        const root = await userService.getRoot();
        res.status(200).json({
            "root": root
        })
    } catch(e) {
        res.status(500).json(e);
    }
});

router.post("/auth_path", 
    body('identity_commitment').notEmpty(),
    async (req, res) => {

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(500).json({ errors: errors.array() });
    }

    try {
        const path = await userService.getPath(req.body.identity_commitment);
        res.status(200).json(path);
    } catch(e) {
        console.log(e);
        res.status(404).json(e);
    }
});


router.get("/banned", async (req, res) => {

    try {
        const all_users = await userService.getAllBannedUsers();
        res.json(all_users);
    } catch(e) {
        res.status(404).json()
    }
});

export default router;