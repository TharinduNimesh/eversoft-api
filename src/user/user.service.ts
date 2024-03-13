import { Injectable } from '@nestjs/common';
import { RegisterRequest } from 'src/auth/request';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(user: RegisterRequest, is_a_blogger: boolean) {
    // define data structure
    const data = {
      ...user,
      password: bcrypt.hashSync(user.password, 12),
      is_verified: 0,
      joined_at: new Date(),
      user_status_id: 1,
    };

    if (is_a_blogger) {
      // create blogger profile
      return await this.prisma.users.create({
        data: {
          ...data,
          bloggers: {
            create: {
              followers_count: 0,
            },
          },
        },
      });
    }

    // create user profile
    return await this.prisma.users.create({
      data,
    });
  }

  async findOne(email: string) {
    return await this.prisma.users.findUnique({
      where: {
        email,
      },
    });
  }
}
