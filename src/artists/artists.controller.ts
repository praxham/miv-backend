import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GetArtistsDto } from './dto/get-artists.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { AdmitArtistDto } from './dto/admit-artist.dto';
import { ArtistService } from './artists.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('artist')
export class ArtistController {
  constructor(private artistService: ArtistService) {}

  @Get()
  async getArtists(@Query() query: GetArtistsDto) {
    return this.artistService.getArtists(query);
  }

  @Patch()
  @UseInterceptors(
    FileInterceptor('profilePhoto', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateArtist(
    @Body() body: UpdateArtistDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    profilePhoto?: Express.Multer.File,
  ) {
    return this.artistService.updateArtist(body, profilePhoto);
  }

  @Post('admit')
  async admitArtist(@Body() body: AdmitArtistDto) {
    return this.artistService.admitArtist(body);
  }
}
