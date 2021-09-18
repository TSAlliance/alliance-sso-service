import { applyDecorators, createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Account } from "src/account/account.entity";
import { Permission } from "src/permission/permission.decorator";

export const Authentication = createParamDecorator<unknown, ExecutionContext, Account>((data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().authentication;
})

export const RequireAuth = () => {
    return applyDecorators(
        Permission(null)
    )
}