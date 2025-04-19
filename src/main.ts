import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('allowedOrigins') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  }); // Allow CORS
  await app.listen(configService.get<string>('port') || 3000, '0.0.0.0');
  console.log(`server running on port:${configService.get<string>('port')}`)
}
bootstrap();
