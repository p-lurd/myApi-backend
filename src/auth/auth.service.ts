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
import {
  BusinessUserDocument,
  BusinessUserModelName,
} from 'src/businesses/schemas/user-business.schema';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { FilteredUserDto } from 'src/users/dto/filtered-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly businessesService: BusinessesService,
    @InjectModel(BusinessUserModelName)
    private businessUserModel: Model<BusinessUserDocument>,
  ) {}
  async validateUser(profile: Profile, res: Response) {
    try {
      const { displayName, emails, photos, id } = profile;
      const email = emails?.[0]?.value;
      const avatar = photos?.[0]?.value;

      const user = {
        githubId: id,
        name: displayName,
        email,
        avatar,
      };
      // user into database
      const userDoc = await this.usersService.create(user);
      const dbUser: UserDto = {
        // _id: userDoc._id.toString(),
        _id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        avatar: userDoc.avatar,
        createdAt: userDoc.createdAt,
      };
      // Ctreate a test business for the person signing up

      // update the user business relationship to add userId
      // const userBusiness = await this.businessesService.updateUserBusiness(dbUser.email, {userId:dbUser._id})
      // // create the userBusiness relationship
      // const userBusiness = await this.businessesService.createUserBusiness(dbUser.name, dbUser._id.toString(), dbUser.email, ROLES.user, dbUser._id.toString());

      const token = await tokenify(this.jwtService, dbUser._id, dbUser.email);
      const cookieOptions= {
        httpOnly: true,
        // Set "secure" to true in production with HTTPS
        secure: process.env.NODE_ENV === 'production',
        sameSite:
          process.env.NODE_ENV === 'production'
            ? ('none' as const)
            : ('lax' as const),
        maxAge: 60 * 60 * 1000,
        // ...(process.env.NODE_ENV === 'production' && {
        //   domain: this.configService.get<string>('DOMAIN'),
        // }),
      }
      res.cookie('authToken', token, cookieOptions);
      const FRONTEND_URL = this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:3001',
      );
      console.log('Redirecting to:', FRONTEND_URL);
      // this delay is for testing purposes
      if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        res.redirect(FRONTEND_URL);
      }, 100);
    } else {
      res.redirect(FRONTEND_URL);
    }
      // res.redirect(FRONTEND_URL);
      // return res.json({user: dbUser}).redirect(FRONTEND_URL);
      // return user; // Return user object
    } catch (error) {
      console.log({ error });
      throw new userValidationFailed('100VU');
    }
  }

  async register(registerUserDto: RegisterUserDto, res: Response) {
    try {
      // const {name, email, password} = registerUserDto;
      // const userData: any = { name, email, password};
      const permittedAdmin = await this.businessUserModel.findOne({
        userEmail: registerUserDto.email,
      });
      if (!permittedAdmin) {
        throw new UnauthorizedException(
          'User not authorized by organization yet',
        );
      }
      const user = await this.usersService.create(registerUserDto);
      const token = await tokenify(
        this.jwtService,
        user._id.toString(),
        user.email,
      );
      // update the user business relationship to add userId
      const userBusiness = await this.businessesService.updateUserBusiness(
        user.email,
        { userId: user._id },
      );
      res.cookie('authToken', token, {
        httpOnly: true,
        // Set "secure" to true in production with HTTPS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
      });
      return plainToInstance(FilteredUserDto, user.toObject?.() || user, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      });
      // return res.status(201).json(user);
    } catch (error) {
      // console.error('Registration Error:', error); // Improved debugging

      if (error instanceof UnauthorizedException) {
        return res.status(401).json({ message: error.message });
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  async login(loginUserDto: LoginUserDto, res: Response) {
    try {
      const { email, password } = loginUserDto;
      const user = await this.usersService.getUserDetails({ email: email });
      if (!user || !user.password) {
        throw new UnauthorizedException('message: wrong email or password');
      } else {
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
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 1000,
        });
        const filteredUser = plainToInstance(FilteredUserDto, user.toObject(), {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        });
        res.status(200).json(filteredUser);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async logout(res: Response) {
    res.clearCookie('authToken', {
      httpOnly: true,
      // Set "secure" to true in production with HTTPS
      secure: process.env.NODE_ENV === 'production',
      // sameSite: 'strict', // or 'lax', depending on your frontend-backend setup
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  }
}
