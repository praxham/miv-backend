import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserSignInDto } from './dto/user-sign-in.dto';
import { CommonResponse } from 'types/common';
import { generateOTP } from 'functions/common';
import bcrypt from 'bcryptjs';
import { VerifyOTPDto } from './dto/otp-verification.dto';
import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { otpEmailHtml } from 'constants/email';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  resend = new Resend(process.env.RESEND_API_KEY);

  findUserByEmailId = async (
    emailId: User['emailId'],
  ): Promise<User | null> => {
    return this.prisma.user.findUnique({
      where: { emailId },
    });
  };

  isOTPExpired = (otpExpiresAt: User['otpExpiresAt']): boolean => {
    if (!otpExpiresAt) return true;

    return new Date() > otpExpiresAt;
  };

  async signIn(data: UserSignInDto): Promise<CommonResponse> {
    const rawOTP = generateOTP();
    const hashedOTP = await bcrypt.hash(rawOTP, 10);
    const spacedOTP = rawOTP.split('').join(' ');
    try {
      const existingUser = await this.findUserByEmailId(data.emailId);

      if (existingUser) {
        await this.prisma.user.update({
          where: { emailId: data.emailId },
          data: {
            otp: hashedOTP,
            otpExpiresAt: new Date(Date.now() + 2 * 60 * 1000),
          },
        });
      } else {
        await this.prisma.user.create({
          data: {
            emailId: data.emailId,
            otp: hashedOTP,
            otpExpiresAt: new Date(Date.now() + 2 * 60 * 1000),
          },
        });
      }
      const { data: resendData, error } = await this.resend.emails.send({
        from: 'Made In Vikhroli <noreply@auth.madeinvikhroli.com>',
        to: [data.emailId],
        subject: `${rawOTP} is your OTP`,
        html: otpEmailHtml.replace('{spacedOTP}', spacedOTP),
      });

      if (error) {
        throw new InternalServerErrorException(
          'An error occurred while processing your request.',
        );
      }

      // if (resendData) {
      return {
        status: 200,
        success: true,
        message: 'OTP has been sent to your email successfully.',
      };
      // }
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  async verifyOTP(data: VerifyOTPDto): Promise<CommonResponse> {
    try {
      const existingUser = await this.findUserByEmailId(data.emailId);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      const isOTPValid = await bcrypt.compare(data.otp, existingUser.otp);
      const storedOTPExpiresAt = existingUser.otpExpiresAt;

      if (isOTPValid && !this.isOTPExpired(storedOTPExpiresAt)) {
        const payload = {
          sub: existingUser.id,
          emailId: existingUser.emailId,
        };
        const token = jwt.sign(payload, process.env['JWT_SECRET'] as string, {
          expiresIn: '7d',
        });
        return {
          status: 200,
          success: true,
          message: 'OTP verified successfully',
          data: { token },
        };
      } else {
        throw new BadRequestException('Invalid or expired OTP');
      }
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
