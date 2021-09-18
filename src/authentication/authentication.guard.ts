import { CanActivate, ExecutionContext, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsufficientPermissionException } from '@tsalliance/rest';
import { Observable } from 'rxjs';
import { PERMISSION_KEY } from 'src/permission/permission.decorator';
import { AuthService } from './authentication.service';

@Injectable({ scope: Scope.REQUEST })
export class AuthenticationGuard implements CanActivate {

  constructor(private reflector: Reflector, private authService: AuthService) {}

  // TODO: Make validator not scope request for better performance

  canActivate(context: ExecutionContext): boolean | Promise < boolean > | Observable < boolean > {
    return new Promise(async (resolve, reject) => {
      try {
        const requiredPermission = this.reflector.get<string>(PERMISSION_KEY, context.getHandler());
        const headers = context.switchToHttp().getRequest().headers;
        const authHeaderValue = headers["authorization"]

        // Check if some permission is required to access route
        if(requiredPermission) {
          // If no header exists -> throw unauthorized
          if(!authHeaderValue) {
            throw new UnauthorizedException()
          } else {

            // If header exists -> proceed with authentication and authorization
            const account = await this.authService.signInWithToken(authHeaderValue);
            if(!account.hasPermission(requiredPermission)) {
              throw new InsufficientPermissionException();
            }
            
            // Make authentication object available to future actions in the handler chain
            // The @Authentication param decorator as an example uses this to return the authentication
            // object.
            context.switchToHttp().getRequest().authentication = account;
            resolve(true)
          }
        } else {
          resolve(true)
        }  
      } catch (err) {
        reject(err)
      }
    });
  }
}
