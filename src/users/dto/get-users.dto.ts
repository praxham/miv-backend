import { PartialType, PickType } from '@nestjs/mapped-types';
import { UserEntity } from 'types/users';

export class GetUsersDto extends PartialType(
  PickType(UserEntity, ['id', 'emailId', 'upiId', 'role'] as const),
) {}
