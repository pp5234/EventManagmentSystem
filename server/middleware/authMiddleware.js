import jwt from "jsonwebtoken";
import {ForbiddenError} from "../utils/errors.js";
import {verifyJwt} from "../utils/jwt.js";

const JsonWebTokenError = jwt.JsonWebTokenError

export async function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new JsonWebTokenError("No token provided"));
        }
        const token = authHeader.split(' ')[1];
        if(!token) {
            return next(new JsonWebTokenError("No token provided"));
        }
        req.user = verifyJwt(token);

        next();
    } catch (err) {
        next(err)
    }
}

export function verifyTokenGraceful(req) {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return false
        }
        const token = authHeader.split(' ')[1];
        if(!token) {
            return false
        }
        req.user = verifyJwt(token);

        return true
    } catch (err) {
        return false
    }
}

export function isAdmin(req, res, next) {
    if (req.user && req.user.type === 'ADMIN') {
        return next();
    }
    return next(new ForbiddenError("Access denied. Admins only."));
}