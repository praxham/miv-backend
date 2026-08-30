import { Body, Controller, Inject, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignInDto } from './dto/user-sign-in.dto';
import { VerifyOTPDto } from './dto/otp-verification.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
    console.log(typeof authService.signIn); // logs the PARAMETER, not this.authService
    console.log('Object.getPrototypeOf:', Object.getPrototypeOf(authService));
  }

  @Post('sign-in')
  async signIn(@Body() body: UserSignInDto) {
    return this.authService.signIn(body);
  }

  @Post('verify-otp')
  async verifyOTP(@Body() body: VerifyOTPDto) {
    return this.authService.verifyOTP(body);
  }
}
