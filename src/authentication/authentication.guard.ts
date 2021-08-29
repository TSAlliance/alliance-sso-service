import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSION_KEY } from 'src/roles/permission.decorator';
import { AuthService } from './authentication.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {

  constructor(private reflector: Reflector, private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise(async (resolve) => {
        const headers = context.switchToHttp().getRequest().headers;
        const authHeaderValue = headers["authorization"]
        console.log(this.authService);

        // const account: Account = await this.authService.signInWithToken(authHeaderValue);

        const requiredPermission = this.reflector.get<string>(PERMISSION_KEY, context.getHandler());
        console.log(requiredPermission);
        /*
        
        

        if (!requiredPermission) {
            return true;
        }*/

        // return requiredRoles.some((role) => user.roles?.includes(role))
        resolve(false)
    });
  }
}
