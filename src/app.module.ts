import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessesModule } from './businesses/businesses.module';

@Module({
  imports: [
    UsersModule, 
    ConfigModule, 
    AuthModule,
    MongooseModule.forRoot('mongodb://localhost:27017/myApi'),
    BusinessesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
