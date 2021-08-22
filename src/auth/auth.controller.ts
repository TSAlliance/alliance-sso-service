import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthCodeDTO, CredentialsDTO, JwtResponseDTO } from './auth.model';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags("Authentication Controller")
export class AuthController {

    constructor(private authService: AuthService){}

    @Post("authenticate")
    public async authenticate(@Body() credentials: CredentialsDTO): Promise<JwtResponseDTO> {
        return this.authService.signInWithCredentials(credentials);
    }

    @Post("authorize")
    public async authorize(@Body() authCode: AuthCodeDTO) {
        return this.authService.authorizeToken(authCode.code);
    }

}
