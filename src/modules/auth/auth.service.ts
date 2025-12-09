import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/models/user.model';
import { GoogleAuthService } from './services/google-auth.service';
import { CustomHttpException } from '@shared/custom.exception';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly jwtExpiresIn: string | number;
  private readonly jwtSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly usersService: UsersService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') ?? '';
    this.jwtExpiresIn =
      this.configService.get<string>('JWT_EXPIRES_IN') ?? '1d';

    if (!this.jwtSecret) {
      throw new CustomHttpException(
        'JWT_SECRET is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async authenticateWithGoogle(idToken: string): Promise<{
    accessToken: string;
    data: {
      user: User;
    };
  }> {
    const user = await this.googleAuthService.authenticate(idToken);
    return this.buildAuthResponse(user);
  }

  async authenticateWithGoogleCallback(code: string): Promise<{
    accessToken: string;
    data: {
      user: User;
    };
  }> {
    const user = await this.googleAuthService.handleCallback(code);
    return this.buildAuthResponse(user);
  }

  private async signJwt(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      googleId: user.googleId,
    };
    const options: JwtSignOptions = {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn as JwtSignOptions['expiresIn'],
    };
    return this.jwtService.signAsync(payload, options);
  }

  private async buildAuthResponse(user: User) {
    const userWithWallet =
      (await this.usersService.findByIdWithWallet(user.id)) ?? user;

    const accessToken = await this.signJwt(userWithWallet as User);

    return {
      accessToken,
      data: {
        user: userWithWallet,
      },
    };
  }
}
