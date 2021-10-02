import { CanActivate, ExecutionContext, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsufficientPermissionException } from '@tsalliance/rest';
import { Observable } from 'rxjs';
import { PERMISSION_KEY } from 'src/permission/permission.decorator';
import { AUTH_REQUIRED_KEY } from './authentication.decorator';
import { AuthService } from './authentication.service';

@Injectable({ scope: Scope.REQUEST })
export class AuthenticationGuard implements CanActivate {

  constructor(private reflector: Reflector, private authService: AuthService) {}

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
          const account = await this.authService.signInWithToken(authHeaderValue);
            
          // Make authentication object available to future actions in the handler chain
          // The @Authentication param decorator as an example uses this to return the authentication
          // object.
          context.switchToHttp().getRequest().authentication = account;
          const params = context.switchToHttp().getRequest().params;
          let includesScopedParam = false

          for(const key in params) {
            if(params[key].toString().toLowerCase() == "@me") {
              params[key] = account.id
              includesScopedParam = true
            }
          }

          // Only check for permissions if there are permissions set on the route handler
          if(permissionsList && !includesScopedParam) {
            // If there are multiple permissions set, it means OR.
            // So only one permission must be granted to successfully proceed.
            const permissionGranted = !!permissionsList.find((permission) => account.hasPermission(permission));

            if(!permissionGranted) {
              throw new InsufficientPermissionException();
            }
          }

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
