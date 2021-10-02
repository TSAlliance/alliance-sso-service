export interface SSOJwtResponseDTO {
    token: string;
    expiresAt?: Date;
    issuedAt?: Date;
}