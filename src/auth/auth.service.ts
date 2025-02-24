import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-github2';
import { Response } from 'express';
import { UserDto } from 'src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { userValidationFailed } from 'src/utilities/exceptions/httpExceptions';



@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService, private readonly jwtService: JwtService, private readonly usersService: UsersService,) {}
  async validateUser(profile: Profile, res: Response) {
    try {
      console.log({profile})
      const {displayName, emails, photos, id } = profile;
      const email = emails?.[0]?.value;
      const avatar = photos?.[0]?.value;
  
      const user = {
        githubId: id,
        name: displayName,
        email,
        avatar,
      };
      console.log({user})
      // user into database
      const userDoc = await this.usersService.create(user)
  
      const dbUser: UserDto = {
        _id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        avatar: userDoc.avatar,
        createdAt: userDoc.createdAt
      };
      
      const payload = { sub: dbUser._id, email };
      const token = this.jwtService.sign(payload);
      res.cookie('authToken', token, {
        httpOnly: true,
        // Set "secure" to true in production with HTTPS
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
    });
    const FRONTEND_URL = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
      return res.redirect(FRONTEND_URL);
      // return user; // Return user object
    } catch (error) {
      console.log({error})
      throw new userValidationFailed('100VU');
    }
   
  }
}
