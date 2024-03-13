import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterRequest, LoginRequest } from './request/index';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { users } from '@prisma/client';
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
    let user: users = await this.userService.findOne(data.email);
    if (user) return null;

    // validate user email & get user type
    const COMPANY_EMAIL_REGEX = /eversoft\.lk$/;
    let is_a_blogger = false;
    let template = 'userWelcome.html';
    let subject = 'Welcome to the Eversoft Community!';

    if (COMPANY_EMAIL_REGEX.test(data.email)) {
      is_a_blogger = true; // Blogger if he has eversoft email
      template = 'bloggerWelcome.html';
      subject = 'Welcome to the Eversoft Blogging Community!';
    }

    // store user in the DB
    user = await this.userService.create(data, is_a_blogger);

    // generate verification code and store in DB
    const verificationCode = this.generateCode();
    this.storeVerificationCode(user.id, verificationCode);

    // send welcome email with email verification code
    this.mailService.send({
      from: `Eversoft Community <${this.configService.get('ZOHO_DEFAULT_FROM_EMAIL')}>`,
      to: user.email,
      subject: subject,
      template,
      context: {
        name: user.name,
        code: verificationCode,
        frontend_url: this.configService.get('FRONTEND_URL'),
      },
    });

    //  Remove Sensitive informations
    delete user.password;

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

    //  Remove Sensitive informations
    delete user.password;

    return {
      user,
      token,
    };
  }

  async storeVerificationCode(user_id: number, code: string) {
    const date = new Date();
    // Add 15 minutes as milliseconds
    const millisecondsToAdd = 15 * 60 * 1000;

    await this.prisma.verifications.create({
      data: {
        user_id,
        code,
        expires_at: new Date(date.getTime() + millisecondsToAdd),
      },
    });
  }

  async createAccessToken(user: users) {
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
