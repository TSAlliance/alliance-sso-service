import { Controller, Post, Body, Put } from '@nestjs/common';
import { Authentication, IsAuthenticated } from '@tsalliance/rest';
import { Account } from 'src/account/account.entity';
import { AuthenticationService } from './authentication.service';
import { CreateAuthenticationDTO } from './dto/create-authentication.dto';
import { CreateAuthorizationDTO } from './dto/create-authorization.dto';
import { RecoverAccountDTO } from './dto/recover-account.dto';
import { RecoveryRequestDTO } from './dto/recover-request.dto';
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
  public async updatePassword(@Body() updatedPasswordDto: UpdatePasswordDTO, @Authentication() authentication: Account) {
    return this.authenticationService.changePassword(authentication.id, updatedPasswordDto);
  }

  @Post("/recovery/request")
  public async requestRecovery(@Body() recoveryRequestDto: RecoveryRequestDTO) {
    return this.authenticationService.requestRecovery(recoveryRequestDto);
  }

  @Post("/recovery/recover")
  public async recoverAccount(@Body() recoverAccountDto: RecoverAccountDTO) {
    return this.authenticationService.recover(recoverAccountDto);
  }
}
