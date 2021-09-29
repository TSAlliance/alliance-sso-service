import { CanActivate, ExecutionContext, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsufficientPermissionException } from '@tsalliance/rest';
import { Observable } from 'rxjs';
import { SSOClient } from 'src';
import { AUTH_REQUIRED_KEY } from '../decorators/ssoAuthentication.decorator';
import { PERMISSION_KEY } from '../decorators/ssoPermission.decorator';

@Injectable({ scope: Scope.REQUEST })
export class AuthenticationGuard implements CanActivate {

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise < boolean > | Observable < boolean > {
    return new Promise(async (resolve, reject) => {
      try {
        const permissionsList: string[] = this.reflector.get<string[]>(PERMISSION_KEY, context.getHandler());
        const requiresAuth: boolean = this.reflector.get<boolean>(AUTH_REQUIRED_KEY, context.getHandler()) || !!permissionsList;
        const headers: any = context.switchToHttp().getRequest().headers;
        const authHeaderValue: string = headers["authorization"]

        if(requiresAuth) {
          // Authentication needed
          // If no header exists -> throw unauthorized
          if(!authHeaderValue) {
            throw new UnauthorizedException()
          }

          // If header exists -> proceed with authentication and authorization
          //const account = await this.authService.signInWithToken(authHeaderValue);
          const account = await SSOClient.instance().authorizeToken(authHeaderValue)

          // Only check for permissions if there are permissions set on the route handler
          if(permissionsList) {
            // If there are multiple permissions set, it means OR.
            // So only one permission must be granted to successfully proceed.
            const permissionGranted = !!permissionsList.find((permission) => account.hasPermission(permission));

            if(!permissionGranted) {
              throw new InsufficientPermissionException();
            }
          }
            
          // Make authentication object available to future actions in the handler chain
          // The @Authentication param decorator as an example uses this to return the authentication
          // object.
          context.switchToHttp().getRequest().authentication = account;
          resolve(true)
        } else {
          // No authentication needed
          resolve(true)
        }
      } catch (err) {
        reject(err)
      }
    });
  }
}
