import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Account } from "src/account/account.entity";

export const Authentication = createParamDecorator<unknown, ExecutionContext, Account>((data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().authentication;
})