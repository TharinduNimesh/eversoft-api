import { Body, Controller, Post } from '@nestjs/common';
import RegisterRequest from './request/register.request';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterRequest) {
    return this.authService.register(body);
  }
}
