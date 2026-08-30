import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UserService } from './users.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUsers(@Body() body: GetUsersDto) {
    return this.userService.getUsers(body);
  }

  @Patch()
  async updateUser(@Body() body: UpdateUserDto) {
    return this.userService.updateUser(body);
  }

  @Delete('')
  async deleteUser(@Body() body: DeleteUserDto) {
    return this.userService.deleteUser(body);
  }
}
