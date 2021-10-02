export type SSOProtocol = "http" | "https" | string;
export interface SSOConfig {
    protocol?: SSOProtocol;
    host: string;
    port?: number;
    path?: string;
}