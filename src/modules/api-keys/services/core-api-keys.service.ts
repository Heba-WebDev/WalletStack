import {
  Injectable,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyModelAction } from '../model-actions/api-key.model-action';
import { ApiKeyPermissionModelAction } from '../model-actions/api-key-permission.model-action';
import { CreateApiKeyDto, ApiKeyExpiry, ApiKeyPermission } from '../dtos/create-api-key.dto';
import { RolloverApiKeyDto } from '../dtos/rollover-api-key.dto';
import { DataSource } from 'typeorm';
import { ApiKey } from '../models/api-key.model';
import { ApiKeyPermission as ApiKeyPermissionModel } from '../models/api-key-permission.model';
import { CustomHttpException } from '@shared/custom.exception';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class CoreApiKeysService {
  private readonly MAX_ACTIVE_KEYS = 5;
  private readonly KEY_PREFIX = 'sk_live_';

  constructor(
    private apiKeyModelAction: ApiKeyModelAction,
    private apiKeyPermissionModelAction: ApiKeyPermissionModelAction,
    private datasource: DataSource,
  ) {}


  private validatePermissions(permissions: string[]): void {
    const validPermissions = Object.values(ApiKeyPermission);
    const invalidPermissions = permissions.filter(
      (permission) => !validPermissions.includes(permission as ApiKeyPermission),
    );

    if (invalidPermissions.length > 0) {
      throw new CustomHttpException(
        `Invalid permissions: ${invalidPermissions.join(', ')}. Valid permissions are: ${validPermissions.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  private convertExpiryToDate(expiry: ApiKeyExpiry): Date {
    const now = new Date();
    switch (expiry) {
      case ApiKeyExpiry.ONE_HOUR:
        return new Date(now.getTime() + 60 * 60 * 1000);
      case ApiKeyExpiry.ONE_DAY:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case ApiKeyExpiry.ONE_MONTH:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case ApiKeyExpiry.ONE_YEAR:
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      default:
        throw new CustomHttpException(
          'Invalid expiry format',
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private generateApiKey(): string {
    const randomPart = randomBytes(32).toString('base64url');
    return `${this.KEY_PREFIX}${randomPart}`;
  }

  private hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }

  private async checkActiveKeysLimit(userId: string): Promise<void> {
    // manually filter expired keys because TypeORM count doesn't support date comparison
    const allKeys = await this.apiKeyModelAction.list({
      filterRecordOptions: {
        userId,
        revokedAt: null,
      } as any,
    });

    const now = new Date();
    const activeKeys = allKeys.payload.filter(
      (key) => key.expiresAt > now,
    );

    if (activeKeys.length >= this.MAX_ACTIVE_KEYS) {
      throw new CustomHttpException(
        `Maximum ${this.MAX_ACTIVE_KEYS} active API keys allowed per user`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createApiKey(
    userId: string,
    createApiKeyDto: CreateApiKeyDto,
  ): Promise<{ apiKey: string; expiresAt: Date; apiKeyRecord: ApiKey }> {
    await this.checkActiveKeysLimit(userId);

    // Validate permissions are valid enum values (additional safety check)
    this.validatePermissions(createApiKeyDto.permissions);

    const apiKey = this.generateApiKey();
    const keyHash = this.hashApiKey(apiKey);
    const expiresAt = this.convertExpiryToDate(createApiKeyDto.expiry);

    return await this.datasource.transaction(async (transaction) => {
      const apiKeyRecord = await this.apiKeyModelAction.create({
        createPayload: {
          userId,
          keyHash,
          keyPrefix: this.KEY_PREFIX,
          name: createApiKeyDto.name,
          expiresAt,
        },
        transactionOptions: {
          useTransaction: true,
          transaction,
        },
      });

      if (!apiKeyRecord) {
        throw new CustomHttpException(
          'Failed to create API key',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const permissionPromises = createApiKeyDto.permissions.map(
        (permission) =>
          this.apiKeyPermissionModelAction.create({
            createPayload: {
              apiKeyId: apiKeyRecord.id,
              permission,
            },
            transactionOptions: {
              useTransaction: true,
              transaction,
            },
          }),
      );

      await Promise.all(permissionPromises);

      // Reload the API key with permissions relation using transaction manager
      const apiKeyWithPermissions = await transaction.findOne(ApiKey, {
        where: { id: apiKeyRecord.id },
        relations: ['permissions'],
      });

      if (!apiKeyWithPermissions) {
        throw new CustomHttpException(
          'Failed to load API key with permissions',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        apiKey,
        expiresAt,
        apiKeyRecord: apiKeyWithPermissions,
      };
    });
  }


  async rolloverApiKey(
    userId: string,
    rolloverDto: RolloverApiKeyDto,
  ): Promise<{ apiKey: string; expiresAt: Date; apiKeyRecord: ApiKey }> {
    const expiredKey = await this.apiKeyModelAction.get(
      { id: rolloverDto.expiredKeyId, userId },
      {},
      ['permissions'],
    );

    if (!expiredKey) {
      throw new CustomHttpException(
        'API key not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const now = new Date();
    if (expiredKey.expiresAt > now) {
      throw new CustomHttpException(
        'API key is not expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (expiredKey.revokedAt) {
      throw new CustomHttpException(
        'Cannot rollover revoked API key',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.checkActiveKeysLimit(userId);

    const apiKey = this.generateApiKey();
    const keyHash = this.hashApiKey(apiKey);
    const expiresAt = this.convertExpiryToDate(rolloverDto.expiry);

    const permissions = expiredKey.permissions?.map((p) => p.permission) || [];

    if (permissions.length === 0) {
      throw new CustomHttpException(
        'Expired key has no permissions to rollover',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.datasource.transaction(async (transaction) => {
      const apiKeyRecord = await this.apiKeyModelAction.create({
        createPayload: {
          userId,
          keyHash,
          keyPrefix: this.KEY_PREFIX,
          name: expiredKey.name,
          expiresAt,
          parentKeyId: expiredKey.id,
        },
        transactionOptions: {
          useTransaction: true,
          transaction,
        },
      });

      if (!apiKeyRecord) {
        throw new CustomHttpException(
          'Failed to create API key',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const permissionPromises = permissions.map((permission) =>
        this.apiKeyPermissionModelAction.create({
          createPayload: {
            apiKeyId: apiKeyRecord.id,
            permission,
          },
          transactionOptions: {
            useTransaction: true,
            transaction,
          },
        }),
      );

      await Promise.all(permissionPromises);

      // Reload the API key with permissions relation using transaction manager
      const apiKeyWithPermissions = await transaction.findOne(ApiKey, {
        where: { id: apiKeyRecord.id },
        relations: ['permissions'],
      });

      if (!apiKeyWithPermissions) {
        throw new CustomHttpException(
          'Failed to load API key with permissions',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        apiKey,
        expiresAt,
        apiKeyRecord: apiKeyWithPermissions,
      };
    });
  }

  async revokeApiKey(userId: string, apiKeyId: string): Promise<void> {
    const apiKey = await this.apiKeyModelAction.get({ id: apiKeyId, userId });

    if (!apiKey) {
      throw new CustomHttpException(
        'API key not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (apiKey.revokedAt) {
      throw new CustomHttpException(
        'API key is already revoked',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.apiKeyModelAction.update({
      identifierOptions: { id: apiKeyId, userId },
      updatePayload: { revokedAt: new Date() },
    });
  }


  async validateApiKey(apiKey: string): Promise<ApiKey | null> {
    const keyHash = this.hashApiKey(apiKey);

    const apiKeyRecord = await this.apiKeyModelAction.get(
      { keyHash },
      {},
      ['permissions'],
    );

    if (!apiKeyRecord) {
      return null;
    }

    const now = new Date();
    if (apiKeyRecord.expiresAt <= now) {
      return null;
    }

    if (apiKeyRecord.revokedAt) {
      return null;
    }

    await this.apiKeyModelAction.update({
      identifierOptions: { id: apiKeyRecord.id },
      updatePayload: { lastUsedAt: new Date() },
    });

    return apiKeyRecord;
  }

  hasPermission(apiKey: ApiKey, permission: ApiKeyPermission): boolean {
    if (!apiKey.permissions) {
      return false;
    }
    return apiKey.permissions.some((p) => p.permission === permission);
  }


  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    const result = await this.apiKeyModelAction.list({
      filterRecordOptions: { userId } as any,
      relations: ['permissions'],
      order: { createdAt: 'DESC' } as any,
    });

    return result.payload;
  }
}

