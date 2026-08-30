import { Module } from '@nestjs/common';
import { ArtistController } from './artists.controller';
import { ArtistService } from './artists.service';
import { R2Service } from 'src/r2.service';

@Module({
  controllers: [ArtistController],
  providers: [ArtistService,R2Service],
})
export class ArtistModule {}
