import express from "express";
import {
    createEventController, deleteEventController, dislikeEventController,
    getEventByCategoryController,
    getEventByIdController, getEventByQueryController, getEventByReactionsController, getEventByTagController,
    getEventController,
    getEventPopularController, likeEventController, updateEventController
} from "../controllers/eventController.js";
import {verifyToken} from "../middleware/authMiddleware.js";

const router = express.Router()

router.get("/", getEventController)
router.get("/popular", getEventPopularController)
router.get("/top-reactions", getEventByReactionsController)
router.get("/category/:id", getEventByCategoryController)
router.get("/tag/:id", getEventByTagController)
router.get("/search/:query", getEventByQueryController)
router.get("/like/:id", likeEventController)
router.get("/dislike/:id", dislikeEventController)
router.get("/:id", getEventByIdController)
router.post("/", verifyToken, createEventController)
router.put("/:id", verifyToken, updateEventController)
router.delete("/:id", verifyToken, deleteEventController)

export default router;