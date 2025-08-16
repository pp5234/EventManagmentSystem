import express from "express";
import {verifyToken} from "../middleware/authMiddleware.js";
import {
    createCategoryController, deleteCategoryController,
    getCategoryController,
    updateCategoryController
} from "../controllers/categoryController.js";

const router = express.Router();

router.get('/', getCategoryController)
router.post('/', verifyToken, createCategoryController)
router.put('/:id', verifyToken, updateCategoryController)
router.delete('/:id', verifyToken, deleteCategoryController)

export default router