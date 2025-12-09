import { Body, Controller, Get, HttpCode, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dtos/google-auth.dto';
import { GoogleAuthDocs } from './docs';
import { GoogleAuthService } from './services/google-auth.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @HttpCode(200)
  @Post('google')
  @GoogleAuthDocs.googleAuth()
  async googleAuth(@Body() payload: GoogleAuthDto) {
    return this.authService.authenticateWithGoogle(payload.idToken);
  }

  @Get('google')
  async googleAuthRedirect(@Res() res: Response) {
    const authUrl = this.googleAuthService.getAuthUrl();
    return res.redirect(authUrl);
  }

  @Get('google/callback')
  async googleAuthCallback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    try {
      const result = await this.authService.authenticateWithGoogleCallback(code);
      return res.json(result);
    } catch (error) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
  }
}
