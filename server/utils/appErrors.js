
export class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.code = 400
        this.type = "BAD_REQUEST";
    }
}

export class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.code = 401
        this.type = "UNAUTHORIZED";
    }
}

export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.code = 404
        this.type = "NOT_FOUND";
    }
}

export class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.code = 403
        this.type = "FORBIDDEN";
    }
}