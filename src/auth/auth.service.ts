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
import { BusinessUserDocument, BusinessUserModelName } from 'src/businesses/schemas/user-business.schema';
import { InjectModel } from '@nestjs/mongoose';


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

      // update the user business relationship to add userId
      const userBusiness = await this.businessesService.updateUserBusiness(dbUser.email, {userId:dbUser._id})

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
      // const {name, email, password} = registerUserDto;
      // const userData: any = { name, email, password};
      const permittedAdmin = await this.businessUserModel.findOne({userEmail: registerUserDto.email})
      if(!permittedAdmin){
        throw new UnauthorizedException('User not authorized by organization yet');
      }
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
      return res.status(201).json(user);
    } catch (error) {
      console.error('Registration Error:', error); // Improved debugging

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
