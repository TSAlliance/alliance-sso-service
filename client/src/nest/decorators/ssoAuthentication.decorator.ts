import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import { SSOAccount } from "src/account/ssoAccount";

export const AUTH_REQUIRED_KEY = "auth_required"
export const RequireAuth = () => {
    return applyDecorators(
        SetMetadata(AUTH_REQUIRED_KEY, true),
    )
}

export const Authentication = createParamDecorator<unknown, ExecutionContext, SSOAccount>((data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().authentication;
})