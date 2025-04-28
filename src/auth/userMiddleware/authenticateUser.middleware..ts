import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../../users/users.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService, private configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.authToken;
    if (!token) {
      throw new UnauthorizedException('Unauthorized: No token provided');
    }

    try {
      const JWT_SECRET = this.configService.get<string>('jwtSecret');
      const payload = jwt.verify(token, JWT_SECRET) as { _id: string; email: string };

      // Fetch user from DB
      const user = await this.usersService.getUserDetails({_id: payload._id});
      if (!user) {
        throw new UnauthorizedException('Unauthorized: User not found');
      }

      // Attach user to request object
      (req as any).user = user;
      next();
    } catch (error) {
      throw new UnauthorizedException('Unauthorized: Invalid token');
    }
  }
}

