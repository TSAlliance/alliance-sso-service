import { AccountType } from "../../src/account/account.entity"
import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from "axios"
import { InternalError } from "./error/errors"
import { SSOConfig } from "./configuration/ssoConfig";
import { SSOSignInOptions } from "./configuration/ssoSignInOptions";
import { SSOStore } from "./store/ssoStore";
import { SSOSession } from "./session/ssoSession";
import { ApiError } from "@tsalliance/sdk";
import { SSOAccount } from "./account/ssoAccount";
import { SSOJwtResponseDTO } from "./dto/jwt.dto";

export class SSOClient {
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

    public useConfig(config: SSOConfig): SSOClient {
        this._config = config;
        this.setBaseUrl();
        this.setAxiosConfig();

        return this;
    }

    public useAxiosConfig(axiosConfig: AxiosRequestConfig): SSOClient {
        this._axiosConf = axiosConfig;
        this.setAxiosConfig();
        return this;
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
            axios.post<SSOJwtResponseDTO>(this.getBaseUrl() + "/authentication/authenticate", {
                accountType: options?.accountType || AccountType.USER,
                identifier,
                password,
                stayLoggedIn: options?.stayLoggedIn || false
            }).then((value: AxiosResponse<SSOJwtResponseDTO>) => {
                // TODO
                SSOClient.session().setSession(value.data)
                resolve(SSOClient._session)
            }).catch((reason: AxiosError) => {
                const error = this.handleAxiosError(reason);

                SSOClient.session().setAuthenticationError(error);
                resolve(SSOClient.session())
            })
        })
    }

    public async authorizeToken(token: string): Promise<SSOAccount> {
        return new Promise((resolve, reject) => {
            axios.get<SSOAccount>(this.getBaseUrl() + "/users/@me").then((value: AxiosResponse<SSOAccount>) => {
                resolve(value.data)
            }).catch((reason: AxiosError) => {
                reject(this.handleAxiosError(reason))
            })
        });
    }

    private handleAxiosError(error: AxiosError): ApiError {
        let err: ApiError;

        if(error.response) {
            // Request made and response received
            err = error.response.data as ApiError
        } else if(error.request) {
            // Request made but no response

        } else {
            // Request could not be built and error was triggered
            console.error(error)
            err = new InternalError();
        }

        return err;
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
            baseUrl += ":" + this._config.port;
        }

        if(this._config?.path) {
            if(this._config.path.endsWith("/")) {
                baseUrl += this._config?.path.slice(0, this._config.path.length - 1);
            } else {
                baseUrl += this._config?.path
            }
        }
        
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
    console.log("sso axios interceptor")

    if(SSOClient.session().isLoggedIn()) {
        conf.headers['Authorization'] = "Bearer " + SSOClient.session().getToken();
    }
    
    return conf;
}