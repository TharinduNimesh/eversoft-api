import { Body, Controller, Post } from '@nestjs/common';
import RegisterRequest from './request/register.request';
import { MailService } from 'src/mail/mail.service';


@Controller('auth')
export class AuthController {
  constructor(private mailService: MailService) {}

  @Post('register')
  register(@Body() body: RegisterRequest) {
    this.mailService.send({
      from: 'tharindunimesh@eversoft.lk',
      to: body.email,
      subject: 'Welcome to Eversoft',
      template: 'BloggerRegister.html',
      context: {
        name: body.name,
      },
    });

    return {
      status: 'Success',
    };
  }
}
