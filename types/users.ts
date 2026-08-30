import { User } from '@prisma/client';
import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';

export class UserEntity implements User {
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty({ message: 'Email ID is required to create an account' })
  emailId: string;

  @IsString()
  otp: string;

  @IsDate()
  otpExpiresAt: Date;

  @IsString()
  @IsOptional()
  upiId: string | null;

  @IsString()
  role: string;

  @IsString()
  @IsOptional()
  username: string | null;

  @IsString()
  @IsOptional()
  profilePhoto: string | null;

  @IsString()
  @IsOptional()
  waNumber: string | null;

  @IsString()
  @IsOptional()
  description: string | null;

  @IsString()
  @IsOptional()
  socials: string | null;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
