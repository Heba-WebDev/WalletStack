import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeysService } from '../../api-keys/api-keys.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import '../types/request.types';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  private jwtGuard: JwtAuthGuard;
  private apiKeyGuard: ApiKeyGuard;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private apiKeysService: ApiKeysService,
  ) {
    this.jwtGuard = new JwtAuthGuard(jwtService, configService);
    this.apiKeyGuard = new ApiKeyGuard(apiKeysService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const apiKey = this.extractApiKeyFromHeader(request);
    if (apiKey) {
      try {
        return await this.apiKeyGuard.canActivate(context);
      } catch (error) {
        throw new UnauthorizedException('Invalid API key');
      }
    }

    const authHeader =
      request.headers.authorization || request.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        return await this.jwtGuard.canActivate(context);
      } catch (error) {
        throw new UnauthorizedException('Invalid JWT token');
      }
    }

    throw new UnauthorizedException(
      'Authentication required. Provide either Bearer token or x-api-key header',
    );
  }

  private extractApiKeyFromHeader(request: Request): string | undefined {
    const apiKey =
      request.headers['x-api-key'] ||
      request.headers['X-Api-Key'] ||
      request.headers['X-API-KEY'];

    return apiKey ? String(apiKey).trim() : undefined;
  }
}

