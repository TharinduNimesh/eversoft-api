import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocationData, LoginRequest, RegisterRequest } from './request';
import { users } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterRequest) {
    const user: users = await this.authService.register(body);

    if (!user) {
      throw new HttpException(
        'User already exists with given email address',
        HttpStatus.BAD_REQUEST,
      );
    }

    const token = await this.authService.createAccessToken(user);

    return {
      status: 'success',
      message: 'User registered successfully',
      token,
    };
  }

  @Post('login')
  async login(@Body() body: LoginRequest, @Ip() ip: string) {
    // tries to login with given credentials
    const result = await this.authService.login(body);
    if (!result) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    // Extract user from result
    const user: users = result.user;

    // get location information of the user, and send security email
    fetch(`https://ipapi.co/${ip}/json/`)
      .then((json) => json.json())
      .then((res: LocationData) => {
        if (res.ip.includes(":")) {
          return;
        }

        // send secuiry login alert
        this.mailService.send({
          to: user.email,
          from: `Eversoft Security Team <${this.configService.get('ZOHO_DEFAULT_FROM_EMAIL')}>`,
          subject: 'Security Alert: Recent Login to Your Eversoft Blog Account',
          template: 'loginAlert.html',
          context: {
            name: user.name,
            time: new Date().toLocaleString('en-US', {
              timeZone: res.timezone || 'Asia/Colombo',
              timeZoneName: 'short',
            }),
            location: `${res.city}, ${res.country_name}`,
            ip,
          },
        });
      })
      .catch((e) => {
        console.error(e);
      });

    return {
      status: 'success',
      message: 'Login Successfully',
      token: result.token,
    };
  }
}
