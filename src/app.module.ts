import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [MailModule, PrismaModule, AuthModule, UserModule],
  controllers: [AuthController],
})
export class AppModule {}
