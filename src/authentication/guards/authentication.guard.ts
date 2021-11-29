import { CanActivate, ExecutionContext, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountNotFoundException, InsufficientPermissionException, PROPERTY_PERMISSION_META_KEY } from '@tsalliance/rest';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication.service';

@Injectable({ scope: Scope.REQUEST })
export class AuthenticationGuard implements CanActivate {

  constructor(private reflector: Reflector, private authService: AuthenticationService) {}

  canActivate(ctx: ExecutionContext): boolean | Promise < boolean > | Observable < boolean > {
    return new Promise(async (resolve, reject) => {
      try {
        const requiredPermissions: string[] = this.reflector.get<string[]>(PROPERTY_PERMISSION_META_KEY, ctx.getHandler());
        const isRouteRequiringPermission: boolean = requiredPermissions?.length > 0 || false;
        const headers: any = ctx.switchToHttp().getRequest().headers;
        const authHeaderValue: string = headers["authorization"]

        console.log("permissions required by route: ", requiredPermissions)
        console.log("is route requiring permission? ", isRouteRequiringPermission)
        console.log("authHeaderValue: ", authHeaderValue.substring(0, 12)+"...")

        // If no header exists and authentication is needed 
        // ==> throw unauthorized
        if(!authHeaderValue && isRouteRequiringPermission) {
          console.log("Authentication failed: No Header value, but route is requiring permissions.")
          throw new UnauthorizedException()
        }

        // Proceed with authentication and authorization
        // Even if route does not required authentication, a request
        // is authenticated if a header was found.
        // Decode access token and validate it to retrieve account data
        console.log("decoding header value")
        const decodedToken = await this.authService.decodeAccessToken(authHeaderValue)
        console.log("authenticating decoded token")
        const account = await this.authService.authenticateAccessToken(decodedToken)

        // TODO: Implement new auth flow in FE

        /*console.log("signing in account...")
        const account = await this.authService.signInWithToken(authHeaderValue);
        console.log("Found account on request: ", account.id)*/

        // Make authentication object available to future actions in the handler chain
        // The @Authentication param decorator as an example uses this to return the authentication
        // object.
        ctx.switchToHttp().getRequest().authentication = account;

        // If account is null but authentication is required
        // ==> throw AccountNotFoundError
        if(!account) {
          if(isRouteRequiringPermission) {
            console.log("Authorization failed: User account does not exist and route requires permission.")
            throw new AccountNotFoundException();
          } else if(this.translateScopedParam(ctx)) {
            console.log("Authorization failed: User account does not exist but route contains scoped parameter")
            throw new UnauthorizedException();
          }
        } else {
          // This variable contains a boolean value.
          // Evaluates to TRUE, if a @me scope was found on the url. This results in requiring the user to be authenticated, but he passes all permission checks.
          const didIncludeScope = this.translateScopedParam(ctx)
          
          if(isRouteRequiringPermission && !didIncludeScope) {
            // If there are multiple permissions set, it means OR.
            // So only one permission must be granted to successfully proceed.
            const permissionGranted = !!requiredPermissions.find((permission) => account.hasPermission(permission));

            if(!permissionGranted) {
              console.log("Authorization failed: Permission required.")
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
