import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDTO, CredentialsDTO, JwtResponseDTO, RecoveryDTO, RegistrationDTO, RequestRecoveryDTO } from './authentication.entity';
import { AuthService } from './authentication.service';

@Controller('authentication')
@ApiTags("Authentication Controller")
export class AuthController {

    constructor(private authService: AuthService){}

    @Post("register")
    public async register(@Body() registration: RegistrationDTO): Promise<void> {
        return this.authService.register(registration)
    }

    @Post("requestRecovery")
    public async requestRecovery(@Body() recovery: RequestRecoveryDTO): Promise<void> {
        return this.authService.requestRecovery(recovery);
    }

    @Post("recover")
    public async recover(@Body() recovery: RecoveryDTO): Promise<void> {
        return this.authService.recover(recovery);
    }

    @Post("changePassword")
    @ApiBearerAuth()
    public async changePassword(@Body() data: ChangePasswordDTO): Promise<void> {
        return this.authService.changeCredentials("123", data);
    }

    @Post("authenticate")
    public async authenticate(@Body() credentials: CredentialsDTO): Promise<JwtResponseDTO> {
        return this.authService.signInWithCredentials(credentials);
    }

}
