import { Controller, Post, Body, Put } from '@nestjs/common';
import { Authentication, IsAuthenticated, RestAccount } from '@tsalliance/rest';
import { User } from 'src/users/user.entity';
import { AuthenticationService } from './authentication.service';
import { CreateAuthenticationDTO } from './dto/create-authentication.dto';
import { CreateAuthorizationDTO } from './dto/create-authorization.dto';
import { RecoverAccountDTO } from './dto/recover-account.dto';
import { RecoveryRequestDTO } from './dto/recover-request.dto';
import { RegistrationDTO } from './dto/registration.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("/authenticate")
  public async authenticate(@Body() createAuthenticationDto: CreateAuthenticationDTO) {
    return this.authenticationService.authenticate(createAuthenticationDto);
  }

  @Post("/authorize")
  public async authorize(@Body() createAuthorizationDto: CreateAuthorizationDTO) {
    return this.authenticationService.authorize(createAuthorizationDto);
  }

  @Put("/password")
  @IsAuthenticated()
  public async updatePassword(@Body() updatedPasswordDto: UpdatePasswordDTO, @Authentication() authentication: RestAccount) {
    return this.authenticationService.changePassword((authentication as User).id, updatedPasswordDto);
  }

  @Post("/recovery/request")
  public async requestRecovery(@Body() recoveryRequestDto: RecoveryRequestDTO) {
    return this.authenticationService.requestRecovery(recoveryRequestDto);
  }

  @Post("/recovery/recover")
  public async recoverAccount(@Body() recoverAccountDto: RecoverAccountDTO) {
    return this.authenticationService.recover(recoverAccountDto);
  }

  @Post("/register")
  public async register(@Body() registrationDto: RegistrationDTO) {
    return this.authenticationService.register(registrationDto);
  }
}
