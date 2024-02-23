import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest } from './request';
import { user } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterRequest) {
    const user: user = await this.authService.register(body);

    if (!user) {
      throw new HttpException(
        'User already exists with given email address',
        HttpStatus.BAD_REQUEST,
      );
    }

    const token = await this.authService.createAccessToken(user);

    return {
      status: 'Success',
      message: 'User registered successfully',
      token,
    };
  }

  @Post('login')
  login(@Body() body: LoginRequest) {
    const user = this.authService.login(body);
    if (!user) {
    }
  }
}
