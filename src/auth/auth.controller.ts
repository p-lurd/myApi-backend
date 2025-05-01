import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  UsePipes,
  Post,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard as ModAuthguard } from './guards/auth.guard';
import { plainToInstance } from 'class-transformer';
import { FilteredUserDto } from 'src/users/dto/filtered-user.dto';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    // Redirects to GitHub for authentication
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubLoginCallback(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    return this.authService.validateUser(req.user, res);
    // return req.user; // Return user data after authentication
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res() res: Response,
  ) {
    return this.authService.register(registerUserDto, res);
  }

  @Get('me')
  @UseGuards(ModAuthguard) // use your auth guard
  getProfile(@Req() req: Request) {
    // return req.user;
    const user = typeof req.user?.toObject === 'function' ? req.user.toObject() : req.user;

  return plainToInstance(FilteredUserDto, user, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true
  });
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    return this.authService.login(loginUserDto, res);
  }

  @Post('logout')
  @UseGuards(ModAuthguard)
  async logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}
