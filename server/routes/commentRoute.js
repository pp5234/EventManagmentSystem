import cookieParser from "cookie-parser";
import {
    deleteCommentController,
    dislikeCommentController,
    likeCommentController, updateCommentController
} from "../controllers/commentController.js";
import {verifyToken} from "../middleware/authMiddleware.js";
import express from "express";

const router  = express.Router();

router.put("/:id",verifyToken, updateCommentController)
router.patch("/like/:id", cookieParser(), likeCommentController)
router.patch("/dislike/:id", cookieParser(), dislikeCommentController)
router.delete("/:id",verifyToken, deleteCommentController)

export default router;
