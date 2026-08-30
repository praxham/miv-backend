import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GetArtifactsDTO } from './dto/get-artifacts.dto';
import { PrismaService } from 'src/prisma.service';
import { CreateArtifactDTO } from './dto/create-artifact.dto';
import { UpdateArtifactDTO } from './dto/update-artifact.dto';
import { CommonResponse } from 'types/common';
import jwt from 'jsonwebtoken';
import { R2Service } from 'src/r2.service';
import { extname } from 'path';

@Injectable()
export class ArtifactsService {
  constructor(
    private prisma: PrismaService,
    private r2: R2Service,
  ) {}
  async getArtifacts(filters: GetArtifactsDTO): Promise<CommonResponse> {
    try {
      const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
      const limit = Number(filters.limit) > 0 ? Number(filters.limit) : 10;

      const skip = (page - 1) * limit;
      const take = limit;
      const result = await this.prisma.artifact.findMany({
        where: { byArtist: filters.byArtist, isPublished: 'true' },
        skip: skip,
        take: take,
      });

      if (!result.length) {
        return {
          status: 400,
          success: false,
          message: 'No Result Found',
        };
      } else {
        return {
          status: 200,
          success: true,
          message: 'artifacts fetched successfully',
          data: {
            result,
            meta: { currentPage: page, limit, count: result.length },
          },
        };
      }
    } catch (e) {
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  async creatArtifact(
    body: CreateArtifactDTO,
    imageFiles: Express.Multer.File[],
    deliverableFiles: Express.Multer.File[],
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

      const userRole = await this.prisma.user.findUnique({
        where: { id },
        select: { role: true },
      });

      if (userRole?.role !== 'artist') {
        throw new BadRequestException('Only artists can creat artifacts');
      }

      const imageUrls: string[] = [];
      const deliverableFileFormats: string[] = [];
      const deliverableFileUrls: string[] = [];

      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (imageFile, index) => {
          const key = `artifact-images/${body.title.trim().replace(' ', '-')}/${index}`;
          return await this.r2.uploadBuffer(
            key,
            'miv-s3',
            imageFile.buffer,
            imageFile.mimetype,
          );
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        imageUrls.push(...uploadedUrls);
      }

      if (deliverableFiles.length > 0) {
        const uploadPromises = deliverableFiles.map(
          async (imageFile, index) => {
            const key = `artifact-deliverables/${body.title.trim().replace(' ', '-')}/${index}`;
            return await this.r2.uploadBuffer(
              key,
              'miv-s3',
              imageFile.buffer,
              imageFile.mimetype,
            );
          },
        );
        const extensions = deliverableFiles.map((file) =>
          extname(file.originalname),
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        deliverableFileUrls.push(...uploadedUrls);
        deliverableFileFormats.push(...extensions);
      }

      const { slug, title, category, description, amount, isPublished } = body;

      await this.prisma.artifact.create({
        data: {
          byArtist: id,
          slug,
          images: JSON.stringify(imageUrls),
          title,
          category,
          description,
          amount,
          isPublished,
          deliverableFileFormats: JSON.stringify(deliverableFileFormats),
          deliverableFiles: JSON.stringify(deliverableFileUrls),
        },
      });

      return {
        status: 200,
        success: true,
        message: `succesfully created artifact`,
      };
    } catch (e) {
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  async updateArtifact(
    body: UpdateArtifactDTO,
    imageFiles?: Express.Multer.File[],
    deliverableFiles?: Express.Multer.File[],
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

      const userRole = await this.prisma.user.findUnique({
        where: { id },
        select: { role: true },
      });

      if (userRole?.role !== 'artist') {
        throw new BadRequestException('Only artists can creat artifacts');
      }

      const imageUrls: string[] = [];
      const deliverableFileFormats: string[] = [];
      const deliverableFileUrls: string[] = [];

      if (imageFiles && imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (imageFile, index) => {
          const key = `artifacts/${user.emailId}-${Date.now()}-${body.title?.trim().replace(' ', '-') + '-' + index}`;
          return await this.r2.uploadBuffer(
            key,
            'miv-s3',
            imageFile.buffer,
            imageFile.mimetype,
          );
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        imageUrls.push(...uploadedUrls);
      }

      if (deliverableFiles && deliverableFiles.length > 0) {
        const uploadPromises = deliverableFiles.map(
          async (imageFile, index) => {
            const key = `artifact-deliverables/${body.title?.trim().replace(' ', '-')}/${index}`;
            return await this.r2.uploadBuffer(
              key,
              'miv-s3',
              imageFile.buffer,
              imageFile.mimetype,
            );
          },
        );
        const extensions = deliverableFiles.map((file) =>
          extname(file.originalname),
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        deliverableFileUrls.push(...uploadedUrls);
        deliverableFileFormats.push(...extensions);
      }

      const { slug, title, category, description, amount, isPublished } = body;

      await this.prisma.artifact.update({
        where: { id },
        data: {
          slug,
          images: JSON.stringify(imageUrls),
          title,
          category,
          description,
          amount,
          deliverableFileFormats: JSON.stringify(deliverableFileFormats),
          deliverableFiles: JSON.stringify(deliverableFileUrls),
          isPublished,
        },
      });

      return {
        status: 200,
        success: true,
        message: `succesfully updated artifact`,
      };
    } catch (e) {
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
