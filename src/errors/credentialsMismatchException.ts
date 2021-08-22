import { ApiError } from "@tsalliance/rest";

export class CredentialsMismatchException extends ApiError {
    constructor() {
        super("Your credentials don't match.", 403, "CREDENTIALS_MISMATCH", false)
    }
}