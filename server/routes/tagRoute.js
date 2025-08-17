import express from "express";
import {verifyToken} from "../middleware/authMiddleware.js";
import {createTagController, deleteTagController, getTagController} from "../controllers/tagController.js";


const router = express.Router()

router.get("/", getTagController);
router.post("/", verifyToken, createTagController)
router.delete("/:id", verifyToken, deleteTagController)

export default router