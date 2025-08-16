import express from "express";
import {isAdmin, verifyToken} from "../middleware/authMiddleware.js";
import {
    changeUserStatusController,
    createUserController, deleteUserController,
    getUserController,
    updateUserController
} from "../controllers/userController.js";

const router = express.Router();

router.get('/', verifyToken, isAdmin, getUserController)
router.post('/', verifyToken, isAdmin, createUserController);
router.put('/:id', verifyToken, isAdmin, updateUserController);
router.patch('/:id/status', verifyToken, isAdmin, changeUserStatusController);
router.delete('/:id', verifyToken, isAdmin, deleteUserController);



export default router
