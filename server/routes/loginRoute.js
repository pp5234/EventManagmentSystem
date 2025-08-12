import express from 'express';
import loginController from "../controllers/loginController.js";
import loginMiddleware from "../middleware/loginMiddleware.js";

const router = express.Router();

router.post('/', loginMiddleware, loginController);

export default router

