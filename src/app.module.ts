import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { ArtifactsModule } from './artifacts/artifacts.module';
import { ArtistModule } from './artists/artists.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ArtifactsModule,
    ArtistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
