export type SSOProtocol = "http" | "https";
export interface SSOConfig {
    protocol?: SSOProtocol;
    host: string;
    port?: number;
    path?: string;
}