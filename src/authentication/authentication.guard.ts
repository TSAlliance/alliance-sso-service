import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Account } from 'src/account/account.entity';
import { PERMISSION_KEY } from 'src/roles/permission.decorator';
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

        if(!!requiredPermission && !authHeaderValue) {
          throw new UnauthorizedException()
        }        

        const account: Account = await this.authService.signInWithToken(authHeaderValue);
        if(account.hasPermission(requiredPermission)) {
          throw new ForbiddenException()
        }
        
        resolve(true)
      } catch (err) {
        reject(err)
      }
    });
  }
}