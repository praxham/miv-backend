import { IsNotEmpty, IsString } from 'class-validator';

export class OTPEntity {
  @IsString()
  @IsNotEmpty({ message: 'Email ID is required to verify account' })
  emailId: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP is required to verify account' })
  otp: string;
}
