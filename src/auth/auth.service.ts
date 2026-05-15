import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginAuthDto, RegisterAuthDto } from './dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '../generated/prisma/internal/prismaNamespace';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async login(dto: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await argon.verify(user.hash, dto.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hash, ...rest } = user;
    return { message: 'Login successful', user: rest };
  }

  async register(dto: RegisterAuthDto) {
    try {
      const { password, ...rest } = dto;

      const hash = await argon.hash(password);

      const user = await this.prisma.user.create({
        data: {
          ...rest,
          // email: dto.email,
          hash,
        },
      });

      return {
        message: 'User created successfully',
        user: { id: user.id, email: user.email },
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Credentials already taken');
      }

      throw error;
    }
  }
}
