import { ApiError } from "@tsalliance/rest";

export class InternalError extends ApiError {
    constructor() {
        super("Internal error occured", "INTERNAL_ERROR", { statusCode: 500, isCritical: true });
    }
}

export class SSOAccountMissingError extends ApiError {
    constructor() {
        super("Account not found.", "NOT_FOUND", { statusCode: 404, isCritical: false });
    }
}

export class SSOSessionExpiredError extends ApiError {
    constructor() {
        super("Session expired.", "SESSION_EXPIRED", { statusCode: 403, isCritical: true });
    }
}

export class SSOUnauthorizedError extends ApiError {
    constructor() {
        super("Unauthorized.", "UNAUTHORIZED", { statusCode: 403, isCritical: true });
    }
}

export class SSOInsufficientPermissionError extends ApiError {
    constructor() {
        super("Insufficient permission.", "INSUFFICIENT_PERMISSION", { statusCode: 403, isCritical: true });
    }
}

export class SSOInvalidRedirectUriError extends ApiError {
    constructor() {
        super("Invalid redirect_uri.", "INVALID_REDIRECT", { statusCode: 400, isCritical: false });
    }
}