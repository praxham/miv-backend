import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
import { UserEntity } from 'types/users';

export class DeleteUserDto {
  @IsNotEmpty({ message: 'token is required to delete account' })
  token: string;
}
