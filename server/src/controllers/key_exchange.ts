import express from "express";
import { body, validationResult } from 'express-validator';
import { keyExchangeService } from "../services";

const router = express.Router();

router.post("/get-bundles", 
    body('receiver_public_key').notEmpty(),
    async (req, res) => {

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ errors: errors.array() });
        }

        try {
            const bundles = await keyExchangeService.getBundles(req.body.receiver_public_key);
            res.status(200).json(bundles);
        } catch (e) {
            console.log(e);
            res.status(500).json(e);
        }

});

router.post("/create-bundle", 
    body('encrypted_content').notEmpty(),
    body('content_hash').notEmpty(),
    body('encrypted_key').notEmpty(),
    body('receiver_public_key').notEmpty(),
    body('zk_proof').notEmpty(),
    body('epoch').notEmpty(),
    body('x_share').notEmpty(),
    async (req, res) => {

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ errors: errors.array() });
        }

        try {
            await keyExchangeService.createBundle({
                encrypted_content: req.body.encrypted_content,
                content_hash: req.body.content_hash,
                encrypted_key: req.body.encrypted_key,
                receiver_public_key: req.body.receiver_public_key,
                zk_proof: req.body.zk_proof,
                epoch: req.body.epoch,
                x_share: req.body.x_share
            });
            res.status(204).json("success");
        } catch (e) {
            console.log(e);
            res.status(500).json(e);
        }

});

router.delete("/delete-bundles", 
    body('bundles').notEmpty(),
    body('zk_proof').notEmpty(),
    body('epoch').notEmpty(),
    body('x_share').notEmpty(),
    async (req, res) => {

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ errors: errors.array() });
        }

        try {
            const deletedItemCount = await keyExchangeService.deleteBundles({
                bundles: req.body.bundles,
                zk_proof: req.body.zk_proof,
                epoch: req.body.epoch,
                x_share: req.body.x_share
            });
            res.status(200).json({
                deletedItemCount: deletedItemCount
            });
        } catch (e) {
            console.log(e);
            res.status(500).json(e);
        }

});

export default router;