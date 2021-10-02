import axios from "axios";
import dotenv from "dotenv"
import path from "path";

import { SSOAccountType } from "./account/ssoAccount"
import { SSOAxiosInterceptor, SSOClient } from "./ssoClient"

const isDev: boolean = process.env.NODE_ENV != "production";
const envFile: string = path.resolve(process.cwd() + "/" + (isDev ? ".dev" : "") + ".env");
dotenv.config({ path: envFile })

axios.interceptors.request.use(SSOAxiosInterceptor)

// Configure client
SSOClient.instance().useConfig({
    host: process.env.SSO_HOST,
    port: +process.env.SSO_PORT,
    protocol: process.env.SSO_PROTOCOL,
    path: process.env.SSO_PATH
})

// Sign in using credentials
SSOClient.instance().signInWithCredentials(process.env.SSO_USERNAME, process.env.SSO_PASSWORD, { accountType: SSOAccountType.USER, stayLoggedIn: false }).then((session) => {

    if(!session.hasError() && session.isLoggedIn()) {
        console.log("Account logged in: ", session.getToken().slice(0, 16) + "...")

        // Get account info from token
        SSOClient.instance().authorizeToken(session.getToken()).then((account) => {
            
            console.log(account)
        })
    } else {
        console.log("Error occured while authenticating...")
        console.error(session.getAuthenticationError())
    }
    
})