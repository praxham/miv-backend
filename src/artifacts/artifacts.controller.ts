import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CreateArtifactDTO } from './dto/create-artifact.dto';
import { GetArtifactsDTO } from './dto/get-artifacts.dto';
import { UpdateArtifactDTO } from './dto/update-artifact.dto';
import { ArtifactsService } from './artifacts.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('artifacts')
export class ArtifactsController {
  constructor(private artifactsService: ArtifactsService) {}

  @Get()
  async getArtifacts(@Query() filters: GetArtifactsDTO) {
    return this.artifactsService.getArtifacts(filters);
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('imageFiles', 4, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async creatArtifact(
    @Body() body: CreateArtifactDTO,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    )
    imageFiles: Express.Multer.File[],
    deliverableFiles: Express.Multer.File[]
  ) {
    return this.artifactsService.creatArtifact(body, imageFiles, deliverableFiles);
  }

  @Patch()
  @UseInterceptors(
    FilesInterceptor('imageFiles', 4, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateArtifact(
    @Body() body: UpdateArtifactDTO,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    )
    imageFiles: Express.Multer.File[],
    deliverableFiles: Express.Multer.File[]
  ) {
    return this.artifactsService.updateArtifact(body, imageFiles, deliverableFiles);
  }
}
