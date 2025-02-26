import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-github2';
import { Response } from 'express';
import { UserDto, UserResponseDto } from 'src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { userValidationFailed } from 'src/utilities/exceptions/httpExceptions';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { tokenify } from './jwt.token';
import * as bcrypt from 'bcryptjs';
import { BusinessesService } from 'src/businesses/businesses.service';
import { Model } from 'mongoose';
import { BusinessUserDocument } from 'src/businesses/schemas/user-business.schema';


@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private businessUserModel: Model<BusinessUserDocument>,
  ) {}
  async validateUser(profile: Profile, res: Response) {
    try {
      console.log({ profile });
      const { displayName, emails, photos, id } = profile;
      const email = emails?.[0]?.value;
      const avatar = photos?.[0]?.value;

      const user = {
        githubId: id,
        name: displayName,
        email,
        avatar,
      };
      console.log({ user });
      // user into database
      const userDoc = await this.usersService.create(user);

      const dbUser: UserDto = {
        _id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        avatar: userDoc.avatar,
        createdAt: userDoc.createdAt,
      };

      const token = await tokenify(this.jwtService, dbUser._id, dbUser.email);
      res.cookie('authToken', token, {
        httpOnly: true,
        // Set "secure" to true in production with HTTPS
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
      });
      const FRONTEND_URL = this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:3001',
      );
      return res.json({user: dbUser}).redirect(FRONTEND_URL);
      // return user; // Return user object
    } catch (error) {
      console.log({ error });
      throw new userValidationFailed('100VU');
    }
  }

  async register(registerUserDto: RegisterUserDto, res: Response) {
    try {
      const permittedAdmin = this.businessUserModel.findOne({email: registerUserDto.email})
      if(!permittedAdmin){throw new UnauthorizedException('user not authorized yet')}
      const user = await this.usersService.create(registerUserDto);
      const token = await tokenify(
        this.jwtService,
        user._id.toString(),
        user.email,
      );
      res.cookie('authToken', token, {
        httpOnly: true,
        // Set "secure" to true in production with HTTPS
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
      });
      res.status(201).json(user);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'message: failed to register user',
      );
    }
  }

  async login(loginUserDto: LoginUserDto, res: Response) {
    try {
      const { email, password } = loginUserDto;
      const user = await this.usersService.getUserDetails({ email: email });
      if (!user) {
        throw new UnauthorizedException('message: wrong email or password');
      }else{
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(400).json({
                success: false,
                message: 'Email or password not found and invalid',
            });
            return;
        }
        const token = await tokenify(
          this.jwtService,
          user._id.toString(),
          user.email,
        );
        res.cookie('authToken', token, {
          httpOnly: true,
          // Set "secure" to true in production with HTTPS
          secure: false,
          sameSite: 'strict',
          maxAge: 60 * 60 * 1000,
        });
        res.status(200).json(user);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
