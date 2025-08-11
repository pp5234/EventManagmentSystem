import express from 'express';
import loginController from "../controllers/loginController.js";
import {verifyCredentials} from "../middleware/loginMiddleware.js";

const router = express.Router();


router.post('/', verifyCredentials, loginController);

export default router

