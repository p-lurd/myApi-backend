import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessesModule } from './businesses/businesses.module';
import { RedisModule, RedisService } from '@liaoliaots/nestjs-redis';
import { RedisConfig } from './redis/redis.config';

const MONGODB_URI = process.env.MONGODB_URI

@Module({
  imports: [
    UsersModule, 
    ConfigModule, 
    AuthModule,
    MongooseModule.forRoot(MONGODB_URI),
    BusinessesModule,
    RedisConfig
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
