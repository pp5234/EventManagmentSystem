
export class AppError extends Error {
    type;
    status;
    constructor(status, message, type) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.type = type;
    }
}

export class BadRequestError extends AppError {
    constructor(message) {
        super(400, message, "BAD_REQUEST");
    }
}

export class UnauthorizedError extends AppError {
    constructor(message) {
        super(401, message, "UNAUTHORIZED");
    }
}

export class NotFoundError extends AppError {
    constructor(message) {
        super(404, message, "NOT_FOUND");
    }
}

export class ForbiddenError extends AppError {
    constructor(message) {
        super(403, message, "FORBIDDEN");
    }
}