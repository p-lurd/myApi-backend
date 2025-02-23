import { Injectable } from '@nestjs/common';
import { Profile } from 'passport-github2';

@Injectable()
export class AuthService {
  async validateUser(profile: Profile) {
    const { id, displayName, emails, photos } = profile;
    const email = emails?.[0]?.value;
    const avatar = photos?.[0]?.value;

    // You can store user details in the database here
    const user = {
      githubId: id,
      name: displayName,
      email,
      avatar,
    };

    return user; // Return user object
  }
}
