import { Injectable } from '@nestjs/common';
import { RegisterRequest } from 'src/auth/request';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(user: RegisterRequest, user_type_id: number) {
    return await this.prisma.user.create({
      data: {
        ...user,
        password: bcrypt.hashSync(user.password, 12),
        is_verified: 0,
        created_at: new Date(),
        user_type_id,
      },
    });
  }

  async findOne(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
