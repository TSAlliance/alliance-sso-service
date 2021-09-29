import { AccountType } from "../../src/account/account.entity"
import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from "axios"
import { InternalError } from "./error/errors"
import { SSOConfig } from "./configuration/ssoConfig";
import { SSOSignInOptions } from "./configuration/ssoSignInOptions";
import { SSOStore } from "./store/ssoStore";
import { SSOSession } from "./session/ssoSession";
import { ApiError } from "@tsalliance/sdk";
import { SSOAccount } from "./account/ssoAccount";

export abstract class SSOClient {
    private static _instance: SSOClient;
    private static readonly _store: SSOStore = new SSOStore();
    private static readonly _session: SSOSession = new SSOSession();

    private _config?: SSOConfig;
    private _axiosConf: AxiosRequestConfig = {};
    private _baseUrl: string;
    
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

    protected setAxiosConfig() {
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
    public async signInWithCredentials(identifier: string, password: string, options?: SSOSignInOptions): Promise<SSOSession> {
        return new Promise((resolve) => {
            axios.post<JwtResponseDTO>(this.getBaseUrl() + "/authentication/authenticate", {
                accountType: options?.accountType || AccountType.USER,
                identifier,
                password,
                stayLoggedIn: options?.stayLoggedIn || false
            }).then((value: AxiosResponse<JwtResponseDTO>) => {
                // TODO
                SSOClient.session().setSession(value.data)
                resolve(SSOClient._session)
            }).catch((reason: AxiosError) => {
                let error: ApiError = new InternalError();

                if(reason.isAxiosError) {
                    error = reason.response.data as ApiError
                }

                SSOClient.session().setAuthenticationError(error);
                resolve(SSOClient.session())
            })
        })
    }

    public async authorizeToken(token: string): Promise<SSOAccount> {
        // TODO
        return;
    }

    /**
     * Builds the baseUrl and saves the result. Takes its information from the config.
     * @returns String
     */
    protected setBaseUrl(): string {
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

export class SSOUserClient extends SSOClient {
    private constructor() {
        super();
        this.setBaseUrl();
        this.setAxiosConfig();
    }
}

export const SSOAxiosInterceptor = (config: AxiosRequestConfig) => {
    const conf = { ...config, ...SSOClient.instance().getAxiosConfig() }

    if(SSOClient.session().isLoggedIn()) {
        conf.headers['Authorization'] = "Bearer " + SSOClient.store().getSession().getToken();
    }
    
    return conf;
}