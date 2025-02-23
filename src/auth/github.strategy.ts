import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Profile } from 'passport-github2';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor( private readonly configService: ConfigService, private readonly authService: AuthService){
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID', ''),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET', ''),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL', ''),
      scope: ['user:email'],
    });
    if (!configService.get('GITHUB_CLIENT_ID')) {
      throw new Error('Missing GITHUB_CLIENT_ID in environment variables');
    }
    if (!configService.get('GITHUB_CLIENT_SECRET')) {
      throw new Error('Missing GITHUB_CLIENT_SECRET in environment variables');
    }
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: Function) {
    return this.authService.validateUser(profile);
    // done(null, profile);
  }
}



// @Injectable()
// export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
//   constructor(private readonly configService: ConfigService, private readonly authService: AuthService) {
//     super({
//       clientID: configService.get<string>('GITHUB_CLIENT_ID', ''),
//       clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET', ''),
//       callbackURL: configService.get<string>('GITHUB_CALLBACK_URL', ''),
//       scope: ['user:email'],
//     });

//     if (!configService.get('GITHUB_CLIENT_ID')) {
//       throw new Error('Missing GITHUB_CLIENT_ID in environment variables');
//     }
//     if (!configService.get('GITHUB_CLIENT_SECRET')) {
//       throw new Error('Missing GITHUB_CLIENT_SECRET in environment variables');
//     }
//   }

//   async validate(accessToken: string, refreshToken: string, profile: Profile, done: Function) {
//     // return this.authService.validateUser(profile);
//     done(null, profile);
//   }
// }