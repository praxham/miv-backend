import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { httpServerHandler } from 'cloudflare:node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

export default httpServerHandler({ port: 3000 });
