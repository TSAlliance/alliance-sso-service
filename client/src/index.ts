import { SSOClient, SSOAxiosInterceptor } from "./ssoClient"
import { AccountType } from "../../src/account/account.entity"
import { SSOConfig } from "./configuration/ssoConfig"

export {
    SSOClient,
    SSOConfig
}

export {
    SSOAxiosInterceptor
}

export {
    
}

SSOClient.instance().useConfig({
    host: "api.tsalliance.eu",
    protocol: "https",
    path: "/sso"
})

SSOClient.instance().signInWithCredentials("zettee", "#Hackme", { accountType: AccountType.USER, stayLoggedIn: false }).then((session) => {
    console.log(session)
    console.log(session.isLoggedIn())
}).catch((error) => {
    console.log(error)
})