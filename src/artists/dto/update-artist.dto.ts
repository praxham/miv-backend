import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { UserEntity } from 'types/users';

export class UpdateArtistDto extends PickType(UserEntity, [
  'emailId',
  'upiId',
  'username',
  'socials',
  'waNumber',
] as const) {
  @IsNotEmpty({ message: `token is required to update artist's details` })
  token: string;

  @IsOptional()
  profilePhoto?: any;
}
