import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { Account } from "src/account/account.entity";
import { CANREAD_KEY, PERMISSION_KEY } from "src/permission/permission.decorator";
import { PermissionItem } from "src/permission/permission.registry";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {

    intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(response => {
                const isPage = !!response["elements"];
                const account: Account = ctx.switchToHttp().getRequest().authentication;
                
                if(isPage) {
                    this.eraseNotPermittedProperties(response["elements"], account)
                } else {
                    this.eraseNotPermittedProperties(response, account)
                }

                return response;
            })
        );
    }

    private eraseNotPermittedProperties(obj: Record<string, any> | Array<Record<string, any>>, account: Account): any {
        if(Array.isArray(obj)) {
            for(const element of obj) {
                this.eraseProperties(element, account)
            }
        } else {
            this.eraseProperties(obj, account);
        }
    }

    private eraseProperties(obj: Record<string, any>, account: Account) {
        for(const key in obj) {
            if(typeof obj[key] === "undefined" || obj[key] === null) {
                obj[key] = undefined
                continue;
            }

            // If no permission is set
            // ==> Property is allowed to be read.
            if(this.needsPermission(obj, key) || !this.canRead(obj, key)) {
                this.eraseProperty(obj, key, account)
            }

            // If obj[key] exists and is nested object
            // ==> check if that object's properties need
            //     special permissions
            if(obj[key] && typeof obj[key] === "object") {
                this.eraseNotPermittedProperties(obj[key], account);
            }
        }
    }

    /**
     * Erase the value of a property of an object
     * @param target Target object
     * @param propertyKey Target property
     * @param account Account data to check for permission
     * @returns True if property was erased
     */
    private eraseProperty(target: any, propertyKey: string, account: Account) {
        const canRead = this.canRead(target, propertyKey);

        if(!canRead) {
            target[propertyKey] = undefined
        } else {
            if(!this.needsPermission(target, propertyKey) && canRead) return;

            const permissionGranted = !!this.getRequiredPermissions(target, propertyKey).find((permission) => account?.hasPermission(permission));
            if(!permissionGranted) {
                target[propertyKey] = undefined
            }
        }
    }

    /**
     * Check if property requires special permission to be read.
     * @param target Target object
     * @param propertyKey Target property of object
     * @returns True or False
     */
    private needsPermission(target: any, propertyKey: string) {
        return !!Reflect.getMetadata(PERMISSION_KEY, target, propertyKey);
    }

    /**
     * Check if a value is allowed to be read.
     * @param target Target object
     * @param propertyKey Target property of object
     * @returns True or False
     */
    private canRead(target: any, propertyKey: string): boolean {
        const canRead = Reflect.getMetadata(CANREAD_KEY, target, propertyKey);
        if(typeof canRead === "undefined" || canRead === null) {
            return true;
        }

        return canRead;
    }

    private getRequiredPermissions(target: any, propertyKey: string): string[] {
        return Reflect.getMetadata(PERMISSION_KEY, target, propertyKey) as string[]
    }
}