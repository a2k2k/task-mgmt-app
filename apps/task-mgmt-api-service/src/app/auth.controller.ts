import { Controller, Post, Body, HttpCode } from '@nestjs/common';

import {
  CreateUserDTO,
  LoginRequest,
  TokenResponse,
  UserDetails,
} from '@tma/shared/api-model';
import { AuthService } from '@tma/backend/auth';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() userSignupDTO: CreateUserDTO): Promise<UserDetails> {
    return this.authService.registerUser(userSignupDTO);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() loginRequest: LoginRequest): Promise<TokenResponse> {
    return this.authService.login(loginRequest);
  }
}
