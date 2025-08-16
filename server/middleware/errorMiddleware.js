import jwt from "jsonwebtoken";
import {AppError, NotFoundError} from "../utils/errors.js";

export function errorMiddleware(err, req, res, next) {
    console.error(err.stack);

    if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ code: "UNAUTHORIZED" });
    }

    if (err instanceof AppError) {
        return res.status(err.status).json({ code: err.type });
    }

    if(err.message.includes("Duplicate entry")) {
        return res.status(400).json({ code: "BAD_REQUEST" });
    }

    return res.status(500).json({ code: "INTERNAL_ERROR" });
}

export function NotFoundMiddleware(req, res, next) {
    next(new NotFoundError("Endpoint doesn't exist"));
}