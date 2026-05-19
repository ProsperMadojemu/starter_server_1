import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { GetUser } from '../auth/decorators';
import type { User } from '../generated/prisma/client';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getUser(@GetUser() user: User) {
    return user;
  }

  @Patch()
  updateUser(@GetUser('id') user_id: number, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(user_id, dto);
  }
}
