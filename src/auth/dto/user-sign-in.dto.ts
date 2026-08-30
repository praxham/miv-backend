import { PickType } from '@nestjs/mapped-types';
import { UserEntity } from 'types/users';
export class UserSignInDto extends PickType(UserEntity, ['emailId'] as const) {}
