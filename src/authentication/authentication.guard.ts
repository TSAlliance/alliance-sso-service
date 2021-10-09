import { CanActivate, ExecutionContext, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountNotFoundException, InsufficientPermissionException } from '@tsalliance/rest';
import { Observable } from 'rxjs';
import { AuthService } from './authentication.service';
import { PERMISSION_KEY, AUTH_REQUIRED_KEY } from "@tsalliance/rest"

@Injectable({ scope: Scope.REQUEST })
export class AuthenticationGuard implements CanActivate {

  constructor(private reflector: Reflector, private authService: AuthService) {}

  canActivate(ctx: ExecutionContext): boolean | Promise < boolean > | Observable < boolean > {
    return new Promise(async (resolve, reject) => {
      try {
        const permissionsList: string[] = this.reflector.get<string[]>(PERMISSION_KEY, ctx.getHandler());
        const requiresAuth: boolean = this.reflector.get<boolean>(AUTH_REQUIRED_KEY, ctx.getHandler()) || !!permissionsList;
        const headers: any = ctx.switchToHttp().getRequest().headers;
        const authHeaderValue: string = headers["authorization"]

        // If no header exists and authentication is needed 
        // ==> throw unauthorized
        if(!authHeaderValue && requiresAuth) {
          throw new UnauthorizedException()
        }

        // Proceed with authentication and authorization
        // Even if route does not required authentication, a request
        // is authenticated if a header was found
        const account = await this.authService.signInWithToken(authHeaderValue);

        // Make authentication object available to future actions in the handler chain
        // The @Authentication param decorator as an example uses this to return the authentication
        // object.
        ctx.switchToHttp().getRequest().authentication = account;

        // If account is null but authentication is required
        // ==> throw AccountNotFoundError
        if(!account) {
          if(requiresAuth) {
            throw new AccountNotFoundException();
          } else if(this.translateScopedParam(ctx)) {
            throw new UnauthorizedException();
          }
        } else {
          if(permissionsList) {
            // If there are multiple permissions set, it means OR.
            // So only one permission must be granted to successfully proceed.
            const permissionGranted = !!permissionsList.find((permission) => account.hasPermission(permission));

            if(!permissionGranted) {
              throw new InsufficientPermissionException();
            }
          }
        }

        resolve(true)
      } catch (err) {
        reject(err)
      }
    });
  }

  /**
   * Translate @me params to actual account id
   * @param ctx ExecutionContext
   * @returns True or False. True if there was a @me scope.
   */
  private translateScopedParam(ctx: ExecutionContext): boolean {
    const params = ctx.switchToHttp().getRequest().params;
    const account = ctx.switchToHttp().getRequest().authentication;
    let includesScopedParam = false

    for(const key in params) {
      if(params[key].toString().toLowerCase() == "@me") {
        params[key] = account.id
        includesScopedParam = true
      }
    }

    return includesScopedParam;
  }
}
