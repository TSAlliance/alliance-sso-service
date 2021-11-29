import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateAuthenticationDTO } from './dto/create-authentication.dto';
import { CreateAuthorizationDTO } from './dto/create-authorization.dto';

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
}
