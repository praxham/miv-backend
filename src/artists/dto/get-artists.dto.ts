import { PartialType, PickType } from '@nestjs/mapped-types';
import { UserEntity } from 'types/users';

export class GetArtistsDto extends PartialType(
  PickType(UserEntity, ['id', 'emailId', 'upiId'] as const),
) {}
