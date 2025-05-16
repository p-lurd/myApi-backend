import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AuthMiddleware } from './auth/userMiddleware/authenticateUser.middleware.';
import * as cookieParser from 'cookie-parser';
import { customCorsMiddleware } from './middlewares/cors.middleware';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const configService = app.get(ConfigService);

  // app.enableCors({
  //   origin: configService.get<string>('allowedOrigins') || 'http://localhost:5173',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  // }); // Allow CORS

  // Custom CORS
  const allowedOrigins = configService.get<string>('allowedOrigins')?.split(',') || ['http://localhost:5173'];

app.use(customCorsMiddleware(allowedOrigins));
  await app.listen(configService.get<string>('port') || 3000, '0.0.0.0');
  console.log(`server running on port:${configService.get<string>('port')}`);
}
bootstrap();
