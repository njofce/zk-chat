import express from "express";
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

router.get("/leaves", async (req, res) => {
    try {
        const leaves: string[] = await userService.getLeaves();
        res.status(200).json(leaves)
    } catch (e) {
        res.status(500).json(e);
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