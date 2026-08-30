import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
import { UserEntity } from 'types/users';

export class UpdateUserDto extends PickType(UserEntity, [
  'emailId',
  'upiId',
] as const) {
  @IsNotEmpty({ message: 'token is required to update account details' })
  token: string;
}
