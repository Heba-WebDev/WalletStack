import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeysService } from '../../api-keys/api-keys.service';
import '../types/request.types';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException('No API key provided');
    }

    const apiKeyRecord = await this.apiKeysService.validateApiKey(apiKey);

    if (!apiKeyRecord) {
      throw new UnauthorizedException('Invalid, expired, or revoked API key');
    }

    // Attach API key info to request
    request.apiKey = apiKeyRecord;
    request.user = {
      id: apiKeyRecord.userId,
      email: '',
      googleId: '',
      sub: apiKeyRecord.userId,
    };

    return true;
  }

  private extractApiKeyFromHeader(request: Request): string | undefined {
    // Check x-api-key header (case-insensitive)
    const apiKey =
      request.headers['x-api-key'] ||
      request.headers['X-Api-Key'] ||
      request.headers['X-API-KEY'];

    return apiKey ? String(apiKey).trim() : undefined;
  }
}

