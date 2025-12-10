import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/models/user.model';
import { CustomHttpException } from '@shared/custom.exception';

interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

@Injectable()
export class GoogleAuthService {
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string;
  private readonly googleClientSecret: string;
  private readonly redirectUri: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.googleClientId =
      this.configService.get<string>('GOOGLE_CLIENT_ID') ?? '';
    this.googleClientSecret =
      this.configService.get<string>('GOOGLE_CLIENT_SECRET') ?? '';
    
    // Determine base URL: use BASE_URL if set, otherwise construct from PORT
    let baseUrl = this.configService.get<string>('BASE_URL');
    if (!baseUrl) {
      const port = this.configService.get<string>('PORT') ?? '6001';
      baseUrl = `http://localhost:${port}`;
    }
    this.redirectUri = `${baseUrl}/v1/auth/google/callback`;

    if (!this.googleClientId) {
      throw new CustomHttpException(
        'GOOGLE_CLIENT_ID is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.googleClient = new OAuth2Client(
      this.googleClientId,
      this.googleClientSecret || undefined,
      this.redirectUri,
    );
  }

  async authenticate(idToken: string): Promise<User> {
    const profile = await this.verifyGoogleIdToken(idToken);
    return this.findOrCreateUser(profile);
  }

  getAuthUrl(): string {
    if (!this.googleClientSecret) {
      throw new CustomHttpException(
        'GOOGLE_CLIENT_SECRET is required for OAuth redirect flow',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return this.googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      prompt: 'consent',
    });
  }

  async handleCallback(code: string): Promise<User> {
    if (!this.googleClientSecret) {
      throw new CustomHttpException(
        'GOOGLE_CLIENT_SECRET is required for OAuth redirect flow',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    try {
      const { tokens } = await this.googleClient.getToken(code);
      this.googleClient.setCredentials(tokens);

      if (!tokens.id_token) {
        throw new BadRequestException('ID token not received from Google');
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        throw new BadRequestException('Google token is missing required fields');
      }

      const profile: GoogleProfile = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email,
        avatarUrl: payload.picture,
      };

      return this.findOrCreateUser(profile);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof CustomHttpException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  private async verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
    let payload: TokenPayload | undefined;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.googleClientId,
      });
      payload = ticket.getPayload();
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      throw new UnauthorizedException(
        `Invalid Google token: ${errorMessage}. Make sure GOOGLE_CLIENT_ID matches the token's audience.`,
      );
    }

    if (!payload?.sub || !payload.email) {
      throw new BadRequestException('Google token is missing required fields');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email,
      avatarUrl: payload.picture,
    };
  }

  private async findOrCreateUser(profile: GoogleProfile): Promise<User> {
    const { googleId, email, name, avatarUrl } = profile;

    const existingByGoogleId = await this.usersService.findByGoogleId(googleId);
    if (existingByGoogleId) {
      const updated =
        (await this.maybeUpdateProfile(existingByGoogleId, profile)) ??
        existingByGoogleId;
      return updated;
    }

    const existingByEmail = await this.usersService.findByEmail(email);
    if (existingByEmail) {
      const updated =
        (await this.usersService.updateUser(existingByEmail.id, {
          googleId,
          name,
          avatarUrl: avatarUrl ?? undefined,
          email,
        })) ?? existingByEmail;
      return updated;
    }

    return await this.usersService.createUser({
      googleId,
      email,
      name,
      avatarUrl: avatarUrl ?? undefined,
    });
  }

  private async maybeUpdateProfile(
    user: User,
    profile: GoogleProfile,
  ): Promise<User | null> {
    const updates: Partial<User> = {};
    if (profile.name && profile.name !== user.name) {
      updates.name = profile.name;
    }
    if (profile.avatarUrl && profile.avatarUrl !== user.avatarUrl) {
      updates.avatarUrl = profile.avatarUrl;
    }
    if (Object.keys(updates).length === 0) {
      return null;
    }
    return this.usersService.updateUser(user.id, updates);
  }
}

