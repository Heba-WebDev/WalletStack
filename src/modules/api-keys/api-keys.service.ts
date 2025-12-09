import { Injectable } from '@nestjs/common';
import { CoreApiKeysService } from './services/core-api-keys.service';
import { CreateApiKeyDto } from './dtos/create-api-key.dto';
import { RolloverApiKeyDto } from './dtos/rollover-api-key.dto';
import { ApiKeyResponseDto } from './dtos/api-key-response.dto';
import { ApiKey } from './models/api-key.model';
import { ApiKeyPermission } from './dtos/create-api-key.dto';

@Injectable()
export class ApiKeysService {
  constructor(
    private readonly coreApiKeysService: CoreApiKeysService,
  ) {}

  async createApiKey(
    userId: string,
    createApiKeyDto: CreateApiKeyDto,
  ): Promise<ApiKeyResponseDto> {
    const result = await this.coreApiKeysService.createApiKey(
      userId,
      createApiKeyDto,
    );

    return {
      api_key: result.apiKey,
      expires_at: result.expiresAt.toISOString(),
      id: result.apiKeyRecord.id,
      name: result.apiKeyRecord.name,
      permissions:
        result.apiKeyRecord.permissions?.map((p) => p.permission) || [],
    };
  }

  async rolloverApiKey(
    userId: string,
    rolloverDto: RolloverApiKeyDto,
  ): Promise<ApiKeyResponseDto> {
    const result = await this.coreApiKeysService.rolloverApiKey(
      userId,
      rolloverDto,
    );

    return {
      api_key: result.apiKey,
      expires_at: result.expiresAt.toISOString(),
      id: result.apiKeyRecord.id,
      name: result.apiKeyRecord.name,
      permissions:
        result.apiKeyRecord.permissions?.map((p) => p.permission) || [],
    };
  }

  async revokeApiKey(userId: string, apiKeyId: string): Promise<void> {
    return await this.coreApiKeysService.revokeApiKey(userId, apiKeyId);
  }

  async validateApiKey(apiKey: string): Promise<ApiKey | null> {
    return await this.coreApiKeysService.validateApiKey(apiKey);
  }

  hasPermission(apiKey: ApiKey, permission: ApiKeyPermission): boolean {
    return this.coreApiKeysService.hasPermission(apiKey, permission);
  }

  async getUserApiKeys(userId: string) {
    const apiKeys = await this.coreApiKeysService.getUserApiKeys(userId);

    return apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      key_prefix: key.keyPrefix,
      permissions: key.permissions?.map((p) => p.permission) || [],
      expires_at: key.expiresAt.toISOString(),
      revoked_at: key.revokedAt?.toISOString() || null,
      last_used_at: key.lastUsedAt?.toISOString() || null,
      created_at: key.createdAt.toISOString(),
    }));
  }
}

