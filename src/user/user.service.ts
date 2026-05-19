import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateUser(userId: number, dto: UpdateUserDto) {
    console.log('Updating user with ID:', userId, 'and data:', dto);
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: { ...dto },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hash, ...rest } = user;

    return rest;
  }
}
