import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { GetArtistsDto } from './dto/get-artists.dto';
import { CommonResponse } from 'types/common';
import jwt from 'jsonwebtoken';
import { AdmitArtistDto } from './dto/admit-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { R2Service } from 'src/r2.service';

@Injectable()
export class ArtistService {
  constructor(
    private prisma: PrismaService,
    private r2: R2Service,
  ) {}

  async getArtists(query?: GetArtistsDto): Promise<CommonResponse> {
    try {
      const response = await this.prisma.user.findMany({
        where: {
          role: 'artist',
          id: query?.id,
          emailId: query?.emailId,
          upiId: query?.upiId,
        },
      });

      if (response.length === 0) {
        return {
          status: 400,
          success: false,
          message: 'no artists found',
        };
      }

      return {
        status: 200,
        success: true,
        message: 'succesfully fetched artists',
        data: response,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  async admitArtist(body: AdmitArtistDto): Promise<CommonResponse> {
    try {
      const user = jwt.verify(body.token, process.env.JWT_SECRET!) as {
        sub: string;
        emailId: string;
      };
      const id = user?.sub;

      if (!id) {
        throw new BadRequestException('Invalid Token');
      }

      if (user.emailId !== process.env.ADMIN_EMAIL) {
        return {
          status: 400,
          success: false,
          message: 'only admins can admit artists',
        };
      }

      await this.prisma.user.update({
        where: { id: body.id },
        data: {
          role: 'artist',
        },
      });

      return {
        status: 200,
        success: true,
        message: 'succesfully admitted artist',
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  async updateArtist(
    body: UpdateArtistDto,
    profilePhoto?: Express.Multer.File,
  ) {
    try {
      const user = jwt.verify(body.token, process.env.JWT_SECRET!) as {
        sub: string;
        emailId: string;
      };

      const id = user?.sub;

      if (!id) {
        throw new BadRequestException('Invalid Token');
      }

      let profilePhotoUrl: string | undefined;

      if (profilePhoto) {
        const key = `artists/${user.emailId}-${Date.now()}-${profilePhoto.originalname}`;
        profilePhotoUrl = await this.r2.uploadBuffer(
          key,
          'profilephotos',
          profilePhoto.buffer,
          profilePhoto.mimetype,
        );
      }

      const { emailId, upiId, username, socials, waNumber } = body;

      await this.prisma.user.update({
        where: { id: id as string },
        data: {
          emailId,
          upiId,
          username,
          socials,
          waNumber,
          profilePhoto: profilePhotoUrl,
        },
      });

      return {
        status: 200,
        success: true,
        message: `succesfully updated artist's details`,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
