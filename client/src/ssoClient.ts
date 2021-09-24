import { JwtResponseDTO } from "../../src/authentication/authentication.entity"
import { AccountType } from "../../src/account/account.entity"
import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from "axios"
import { ApiError } from "@tsalliance/sdk"
import { InternalError } from "./errors"

export interface SSOConfig {
    protocol?: ("http" | "https");
    host: string;
    port?: number;
    path?: string;
}

export interface SSOSignInOptions {
    accountType?: AccountType;
    stayLoggedIn?: boolean;
}

export class SSOSession implements JwtResponseDTO {
    public token: string;
    public expiresAt?: Date;
    public issuedAt?: Date;

    public isLoggedIn(): boolean {
        return this.token && this.expiresAt?.getTime() > Date.now();
    }
}

export class SSOStore {

    private session?: SSOSession;

    public getSession(): SSOSession {
        return this.session;
    }

}

export class SSOClient {
    private static _instance: SSOClient;
    private static _store: SSOStore = new SSOStore();
    private static _session: SSOSession = new SSOSession();

    private _config?: SSOConfig;
    private _axiosConf: AxiosRequestConfig = {};
    private _baseUrl: string;

    private constructor() {
        this.setBaseUrl();
        this.setAxiosConfig();
    }

    public static instance(): SSOClient {
        if(!this._instance) {
            this._instance = new SSOClient();
        }

        return this._instance;
    }

    public static store(): SSOStore {
        return this._store;
    }

    public static session(): SSOSession {
        return this._session;
    }

    public useConfig(config: SSOConfig) {
        this._config = config;
        this.setBaseUrl();
        this.setAxiosConfig();
    }

    public useAxiosConfig(axiosConfig: AxiosRequestConfig) {
        this._axiosConf = axiosConfig;
        this.setAxiosConfig();
    }

    public getAxiosConfig(): AxiosRequestConfig {
        return this._axiosConf;
    }

    private setAxiosConfig() {
        this._axiosConf.baseURL = this._baseUrl;
        this._axiosConf.responseType = "json";
    }

    public async verifySession() {
        // TODO
    }

    /**
     * Sign in the user with provided credentials
     * @param identifier Email or username
     * @param password User's password
     * @returns Promise of type JwtResponseDTO
     */
    public async signInWithCredentials(identifier: string, password: string, options?: SSOSignInOptions): Promise<JwtResponseDTO> {
        return new Promise((resolve, reject) => {
            axios.post<JwtResponseDTO>(this.getBaseUrl() + "/authentication/authenticate", {
                accountType: options?.accountType || AccountType.USER,
                identifier,
                password,
                stayLoggedIn: options?.stayLoggedIn || false
            }).then((value: AxiosResponse<JwtResponseDTO>) => {
                // TODO
                resolve(value.data)
            }).catch((reason: AxiosError) => {
                if(reason.isAxiosError) {
                    reject(reason.response.data)
                } else {
                    reject(new InternalError())
                }
            })
        })
    }

    /**
     * Builds the baseUrl and saves the result. Takes its information from the config.
     * @returns String
     */
    private setBaseUrl(): string {
        const protocol = (this._config?.protocol || "http") + "://";
        const host = (this._config?.host || "localhost");
        let baseUrl = protocol + host;

        if(this._config?.port && this._config.port != 80 && this._config.port != 443) {
            baseUrl += this._config.port;
        }

        baseUrl += this._config?.path || ""

        this._baseUrl = baseUrl;
        return baseUrl;
    }

    public getBaseUrl() {
        return this._baseUrl;
    }

}

export const SSOInterceptor = (config: AxiosRequestConfig) => {
    const conf = { ...config, ...SSOClient.instance().getAxiosConfig() }

    if(SSOClient.session().isLoggedIn()) {
        conf.headers['Authorization'] = "Bearer " + SSOClient.store().getSession().token
    }
    
    return conf;
}