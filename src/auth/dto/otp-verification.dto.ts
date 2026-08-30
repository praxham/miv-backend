import { PickType } from '@nestjs/mapped-types';
import { OTPEntity } from 'types/otp';
export class VerifyOTPDto extends PickType(OTPEntity, [
  'emailId',
  'otp',
] as const) {}
