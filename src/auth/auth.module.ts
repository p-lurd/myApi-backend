import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { GithubStrategy } from './github.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessSchema } from 'src/businesses/schemas/business.schema';
import { BusinessUserSchema } from 'src/businesses/schemas/user-business.schema';
import { BusinessesModule } from 'src/businesses/businesses.module';
import { BusinessesService } from 'src/businesses/businesses.service';

@Module({
  imports: [
    UsersModule,
    BusinessesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'github' }),
    MongooseModule.forFeature([
      { name: 'Business', schema: BusinessSchema },
      { name: 'BusinessUser', schema: BusinessUserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthService, GithubStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
