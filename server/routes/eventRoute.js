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
import {addCommentController} from "../controllers/commentController.js";

const router = express.Router()


router.use(cookieParser());
router.get("/popular", getEventPopularController);
router.get("/top-reactions", getEventByReactionsController);
router.get("/category/:id", getEventByCategoryController);
router.get("/tag/:id", getEventByTagController);
router.get("/search/:query", getEventByQueryController);
router.get("/:id/comment", addCommentController);
router.get("/:id", getEventByIdController);
router.get("/", getEventController);
router.post("/", verifyToken, createEventController);
router.post("/:id/comment", addCommentController);
router.patch("/like/:id", likeEventController);
router.patch("/dislike/:id", dislikeEventController);
router.put("/:id", verifyToken, updateEventController);
router.delete("/:id", verifyToken, deleteEventController);

export default router;