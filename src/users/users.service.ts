import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { GetUsersDto } from './dto/get-users.dto';
import { CommonResponse } from 'types/common';
import { UpdateUserDto } from './dto/update-user.dto';
import jwt from 'jsonwebtoken';
import { DeleteUserDto } from './dto/delete-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers(data?: GetUsersDto): Promise<CommonResponse> {
    let response: any;
    try {
      if (data && (data.emailId || data.id || data.role || data.upiId)) {
        response = await this.prisma.user.findMany({
          where: {
            id: data.id,
            emailId: data.emailId,
            role: data.role,
            upiId: data.upiId,
          },
        });
      }

      response = await this.prisma.user.findMany();

      return {
        status: 200,
        success: true,
        message: 'succesfully fetched users',
        data: response,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  async updateUser(data: UpdateUserDto): Promise<CommonResponse> {
    try {
      const user = jwt.verify(data.token, process.env.JWT_SECRET!);
      const id = user?.sub;

      if (!id) {
        throw new BadRequestException('Invalid Token');
      }

      if (data.emailId) {
        await this.prisma.user.update({
          where: { id: id as string },
          data: {
            emailId: data.emailId,
          },
        });
      }

      if (data.upiId) {
        await this.prisma.user.update({
          where: { id: id as string },
          data: {
            upiId: data.upiId,
          },
        });
      }

      return {
        status: 200,
        success: true,
        message: 'details updated sucessfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  async deleteUser(data: DeleteUserDto): Promise<CommonResponse> {
    try {
      const userId = jwt.verify(data.token, process.env.JWT_SECRET!);
      const id = userId?.sub;

      if (!id) {
        throw new BadRequestException('Invalid Token');
      }

      await this.prisma.user.delete({
        where: {
          id: id as string,
        },
      });

      return {
        status: 200,
        success: true,
        message: 'user deleted sucessfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
