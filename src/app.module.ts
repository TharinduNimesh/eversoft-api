import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [AuthController],
})
export class AppModule {}
