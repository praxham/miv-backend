import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
import { UserEntity } from 'types/users';

export class AdmitArtistDto extends PickType(UserEntity, ['id'] as const) {
  @IsNotEmpty({ message: 'token is required to admit artist' })
  token: string;
}
