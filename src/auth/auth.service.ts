import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterRequest, LoginRequest } from './request/index';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { user } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private mailService: MailService,
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  async register(data: RegisterRequest) {
    // check if user already exists
    let user: user = await this.userService.findOne(data.email);
    if (user) return null;

    // validate user email & get user type
    const COMPANY_EMAIL_REGEX = /eversoft\.lk$/;
    let user_type_id: number;
    let template: string;
    let subject: string;

    if (COMPANY_EMAIL_REGEX.test(data.email)) {
      user_type_id = 2; // Blogger if he has eversoft email
      template = 'bloggerWelcome.html';
      subject = 'Welcome to the Eversoft Blogging Community!';
    } else {
      user_type_id = 1; // User if he doesn't have eversoft email
      template = 'userWelcome.html';
      subject = 'Welcome to the Eversoft Community!';
    }

    // store user in the DB
    user = await this.userService.create(data, user_type_id);

    // generate verification code and store in DB
    const verificationCode = this.generateCode();
    this.storeVerificationCode(user.id, verificationCode, 1); // Type 1 is EMAIL_VALIDATION

    // send welcome email with email verification code
    this.mailService.send({
      from: this.configService.get('ZOHO_DEFAULT_FROM_EMAIL'),
      to: user.email,
      subject: subject,
      template,
      context: {
        name: user.name,
        code: verificationCode,
        frontend_url: this.configService.get('FRONTEND_URL'),
      },
    });

    return user;
  }

  async login(data: LoginRequest) {
    // check user exists or not
    const user = await this.userService.findOne(data.email);
    if (!user) return null;

    // compare password with hash
    const is_password_correct = bcrypt.compareSync(
      data.password,
      user.password,
    );
    if (!is_password_correct) return null;

    // generate access token
    const token = await this.createAccessToken(user);

    delete user.password;

    return {
      user,
      token
    };
  }

  async storeVerificationCode(user_id: number, code: string, type: number) {
    const date = new Date();
    // Add 15 minutes as milliseconds
    const millisecondsToAdd = 15 * 60 * 1000;

    await this.prisma.verifications.create({
      data: {
        verification_type_id: type,
        created_at: date,
        expires_at: new Date(date.getTime() + millisecondsToAdd),
        user_id,
        code,
      },
    });
  }

  async createAccessToken(user: user) {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    const token: string = await this.jwt.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    });
    return token;
  }

  generateCode(length: number = 20): string {
    const ALLOWED_CHARS: string =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const CHARS_LENGTH = ALLOWED_CHARS.length;
    let result: string = '';

    for (let i = 0; i < length; i++) {
      result += ALLOWED_CHARS.charAt(Math.floor(Math.random() * CHARS_LENGTH));
    }

    return result;
  }
}
