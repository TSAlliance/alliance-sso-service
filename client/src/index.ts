import { SSOClient, SSOConfig } from "./ssoClient"
import { AccountType } from "../../src/account/account.entity"

export {
    SSOClient,
    SSOConfig
}

SSOClient.instance().useConfig({
    host: "api.tsalliance.eu",
    protocol: "https",
    path: "/"
})

SSOClient.instance().signInWithCredentials("zettee", "#Hackme1", { accountType: AccountType.USER, stayLoggedIn: true }).then((response) => {
    console.log(response)
}).catch((error) => {
    console.log(error)
})