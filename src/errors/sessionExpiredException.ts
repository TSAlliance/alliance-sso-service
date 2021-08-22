import { ApiError } from "@tsalliance/rest";

export class SessionExpiredException extends ApiError {
    constructor() {
        super("Your session is expired.", 403, "SESSION_EXPIRED", false)
    }
}