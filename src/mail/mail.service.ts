import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import MailRequest from './request/mail.request';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailService: MailerService,
    private configService: ConfigService,
  ) {}

  async send(options: MailRequest) {
    // setup mailer options
    const mailOptions: ISendMailOptions = {
      from: options.from || this.configService.get("ZOHO_DEFAULT_FROM_EMAIL"),
      to: options.to,
      subject: options.subject,
    };

    // setup text based mail if template is not provided
    if (options.text) {
      mailOptions.text = options.text;
      return this.mailService.sendMail(mailOptions);
    }

    // get template file
    const path = `${this.configService.get('PROJECT_PATH')}/src/mail/templates/${options.template}`;
    const file = fs.readFileSync(path);

    // compile & setup template
    const template = Handlebars.compile(file.toString());
    mailOptions.html = template(options.context);

    return this.mailService.sendMail(mailOptions);
  }
}
