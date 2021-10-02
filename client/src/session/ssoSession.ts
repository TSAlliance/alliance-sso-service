import { ApiError } from "@tsalliance/sdk";
import { SSOAccount } from "src/account/ssoAccount";
import { SSOJwtResponseDTO } from "src/dto/jwt.dto";

export class SSOSession {
    private token: string;
    private issuedAt: Date;
    private expiresAt?: Date;
    private authenticationError?: ApiError;
    private account?: SSOAccount;

    public getToken() {
        return this.token;
    }
    public getIssuedAt() {
        return this.issuedAt;
    }
    public getExpiresAt() {
        return this.expiresAt;
    }
    public getAuthenticationError() {
        return this.authenticationError;
    }
    public getAccount() {
        return this.account
    }

    public hasError(): boolean {
        return !!this.authenticationError;
    }

    /**
     * Check if the session is considered logged in. Evaluates to true if a valid token exists.
     * @returns True or False
     */
    public isLoggedIn(): boolean {
        return !this.authenticationError && !! this.token;
    }

    /**
     * Set token response as new session. This clears all authentication errors.
     * @param tokenResponse Response to save as session
     */
    public setSession(tokenResponse: SSOJwtResponseDTO) {
        this.clear();
        this.token = tokenResponse.token;
        this.issuedAt = tokenResponse.issuedAt;
        this.expiresAt = tokenResponse.expiresAt;
    }

    /**
     * Clears the session by setting all fields to undefined.
     */
    public clear() {
        this.token = undefined;
        this.issuedAt = undefined;
        this.expiresAt = undefined;
        this.authenticationError = undefined;
    }

    /**
     * Set the error that occured when authenticating. This automatically clears the session.
     * @param error Error object to set.
     */
    public setAuthenticationError(error: ApiError) {
        this.clear();
        this.authenticationError = error;

    }
}