import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessesModule } from './businesses/businesses.module';
import { RedisModule, RedisService } from '@liaoliaots/nestjs-redis';
import { ApiMonitorModule } from './api/api.module';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';



@Module({
  imports: [
    ConfigModule.forRoot({
      load:[configuration],
      isGlobal: true
    }),
    UsersModule, 
    ConfigModule, 
    AuthModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
    }),
    BusinessesModule,
    ApiMonitorModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
