import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
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
import { AuthMiddleware } from './auth/userMiddleware/authenticateUser.middleware.';



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
// export class AppModule {}

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer){
    consumer
      .apply(AuthMiddleware)
      .exclude(
        'auth/login',
        'auth/register',
        'auth/github',
        'auth/github/callback',
        {path: 'api/all/(.*)', method: RequestMethod.GET},
        // { path: 'api/([^d]|d[^a]|da[^s]|das[^h]|dash[^b]|dashb[^o]|dashbo[^a]|dashboa[^r]|dashboar[^d]|dashboard.*).*', method: RequestMethod.GET },
        // { path: 'api/(.*)', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}