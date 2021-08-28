import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CredentialsDTO, JwtResponseDTO, RecoveryDTO, RegistrationDTO, RequestRecoveryDTO } from './auth.entity';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags("Authentication Controller")
export class AuthController {

    constructor(private authService: AuthService){}

    @Post("register")
    public async register(@Body() registration: RegistrationDTO): Promise<void> {
        this.authService.register(registration)
    }

    @Post("requestRecovery")
    public async requestRecovery(@Body() recovery: RequestRecoveryDTO): Promise<void> {
        return this.authService.requestRecovery(recovery);
    }

    @Post("recover")
    public async recover(@Body() recovery: RecoveryDTO): Promise<void> {
        return this.authService.recover(recovery);
    }

    @Post("authenticate")
    public async authenticate(@Body() credentials: CredentialsDTO): Promise<JwtResponseDTO> {
        return this.authService.signInWithCredentials(credentials);
    }

    /*@Post("authorize")
    @ApiBearerAuth()
    public async authorize(@Headers() headers: any) {        
        return this.authService.signInWithToken(headers["authorization"]);
    }*/

}
