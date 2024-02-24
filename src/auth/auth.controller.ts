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
import { user } from '@prisma/client';
import ipLocation from 'iplocation';
import { MailService } from 'src/mail/mail.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailService: MailService,
  ) {}

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
      status: 'success',
      message: 'User registered successfully',
      token,
    };
  }

  @Post('login')
  async login(@Body() body: LoginRequest, @Ip() ip: string) {
    // tries to login with given credentials
    const user = await this.authService.login(body);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    // get location information of the user
    let location: string;
    let locationdata: any;
    try {
      locationdata = await ipLocation('112.134.194.39');
      locationdata = locationdata as LocationData;
      location = `${locationdata.location.city}, ${locationdata.location.country.name}`;
    } catch (err) {
      location = 'Colombo, Sri Lanka';
    }

    // send secuiry login alert
    this.mailService.send({
      to: user.email,
      subject: 'Security Alert: Recent Login to Your Eversoft Blog Account',
      template: 'loginAlert.html',
      context: {
        name: user.name,
        time: new Date().toLocaleString('en-US', {
          timeZone: locationdata.country?.timezone?.code || 'Asia/Colombo',
          timeZoneName: 'short',
        }),
        location,
        ip,
      },
    });

    return {
      status: 'success',
      message: 'Login Successfully',
    };
  }
}
