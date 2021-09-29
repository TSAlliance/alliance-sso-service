import { ApiError } from "@tsalliance/sdk"

export class InternalError extends ApiError {
    constructor() {
        super("Internal error occured", 500, "INTERNAL_ERROR");
    }
}

export class SSOAccountMissingError extends ApiError {
    constructor() {
        super("Account not found.", 404, "NOT_FOUND");
    }
}

export class SSOSessionExpiredError extends ApiError {
    constructor() {
        super("Session expired.", 403, "SESSION_EXPIRED");
    }
}

export class SSOUnauthorizedError extends ApiError {
    constructor() {
        super("Unauthorized.", 403, "UNAUTHORIZED");
    }
}

export class SSOInsufficientPermissionError extends ApiError {
    constructor() {
        super("Insufficient permission.", 403, "INSUFFICIENT_PERMISSION");
    }
}