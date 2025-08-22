import express from "express";
import {
    createEventController, deleteEventController, dislikeEventController,
    getEventByCategoryController,
    getEventByIdController, getEventByQueryController, getEventByReactionsController, getEventByTagController,
    getEventController,
    getEventPopularController, likeEventController, updateEventController
} from "../controllers/eventController.js";
import {verifyToken} from "../middleware/authMiddleware.js";
import cookieParser from "cookie-parser"

const router = express.Router()

router.get("/", getEventController)
router.get("/popular", getEventPopularController)
router.get("/top-reactions", getEventByReactionsController)
router.get("/category/:id", getEventByCategoryController)
router.get("/tag/:id", getEventByTagController)
router.get("/search/:query", getEventByQueryController)
router.get("/like/:id", cookieParser(), likeEventController)
router.get("/dislike/:id", cookieParser(), dislikeEventController)
router.get("/:id", cookieParser(), getEventByIdController)
router.post("/", verifyToken, createEventController)
router.put("/:id", verifyToken, updateEventController)
router.delete("/:id", verifyToken, deleteEventController)

export default router;