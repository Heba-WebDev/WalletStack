import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateApiKeyDto } from '../dtos/create-api-key.dto';
import { RolloverApiKeyDto } from '../dtos/rollover-api-key.dto';
import { ApiKeyResponseDto } from '../dtos/api-key-response.dto';
import {
  BadResponseDto,
  UnauthorizedResponseDto,
  ValidationResponseDto,
} from '@shared/docs-response.dto';

export class ApiKeysDocs {
  static createApiKey() {
    return applyDecorators(
      ApiOperation({
        summary: 'Create API Key',
        description:
          'Create a new API key with specified permissions and expiry. Maximum 5 active keys per user.',
      }),
      ApiBody({ type: CreateApiKeyDto }),
      ApiBearerAuth('JWT-auth'),
      ApiResponse({
        status: 200,
        description: 'API key created successfully',
        type: ApiKeyResponseDto,
        schema: {
          example: {
            api_key: 'sk_live_xxxxx',
            expires_at: '2025-01-01T12:00:00Z',
            id: '7f44fb53-450c-4b7b-bcb7-7fe33c56ad68',
            name: 'wallet-service',
            permissions: ['deposit', 'transfer', 'read'],
          },
        },
      }),
      ApiBadRequestResponse({
        description: 'Invalid request parameters or maximum active keys reached',
        type: BadResponseDto,
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Maximum 5 active API keys allowed per user',
            status_code: 400,
          },
        },
      }),
      ApiUnauthorizedResponse({
        description: 'Unauthorized - Invalid or missing JWT token',
        type: UnauthorizedResponseDto,
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Unauthorized',
            status_code: 401,
          },
        },
      }),
      ApiResponse({
        status: 422,
        description: 'Validation error',
        type: ValidationResponseDto,
      }),
      ApiResponse({
        status: 500,
        description: 'Internal server error',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Failed to create API key',
            status_code: 500,
          },
        },
      }),
    );
  }

  static rolloverApiKey() {
    return applyDecorators(
      ApiOperation({
        summary: 'Rollover Expired API Key',
        description:
          'Create a new API key using the same permissions as an expired key. The expired key must be truly expired and not revoked.',
      }),
      ApiBody({ type: RolloverApiKeyDto }),
      ApiBearerAuth('JWT-auth'),
      ApiResponse({
        status: 200,
        description: 'API key rolled over successfully',
        type: ApiKeyResponseDto,
        schema: {
          example: {
            api_key: 'sk_live_xxxxx',
            expires_at: '2025-02-01T12:00:00Z',
            id: '8f55gb64-561d-5c8c-cdc8-8gf44c67be79',
            name: 'wallet-service',
            permissions: ['deposit', 'transfer', 'read'],
          },
        },
      }),
      ApiBadRequestResponse({
        description:
          'Invalid request parameters, API key not expired, or already revoked',
        type: BadResponseDto,
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'API key is not expired',
            status_code: 400,
          },
        },
      }),
      ApiUnauthorizedResponse({
        description: 'Unauthorized - Invalid or missing JWT token',
        type: UnauthorizedResponseDto,
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Unauthorized',
            status_code: 401,
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'API key not found',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'API key not found',
            status_code: 404,
          },
        },
      }),
      ApiResponse({
        status: 422,
        description: 'Validation error',
        type: ValidationResponseDto,
      }),
      ApiResponse({
        status: 500,
        description: 'Internal server error',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Failed to create API key',
            status_code: 500,
          },
        },
      }),
    );
  }

  static getUserApiKeys() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get User API Keys',
        description: 'Get all API keys for the authenticated user.',
      }),
      ApiBearerAuth('JWT-auth'),
      ApiResponse({
        status: 200,
        description: 'API keys retrieved successfully',
        schema: {
          example: [
            {
              id: '7f44fb53-450c-4b7b-bcb7-7fe33c56ad68',
              name: 'wallet-service',
              key_prefix: 'sk_live_',
              permissions: ['deposit', 'transfer', 'read'],
              expires_at: '2025-01-01T12:00:00Z',
              revoked_at: null,
              last_used_at: '2024-12-01T10:30:00Z',
              created_at: '2024-12-01T08:00:00Z',
            },
            {
              id: '8f55gb64-561d-5c8c-cdc8-8gf44c67be79',
              name: 'payment-service',
              key_prefix: 'sk_live_',
              permissions: ['deposit', 'read'],
              expires_at: '2025-06-01T12:00:00Z',
              revoked_at: null,
              last_used_at: null,
              created_at: '2024-11-15T14:20:00Z',
            },
          ],
        },
      }),
      ApiUnauthorizedResponse({
        description: 'Unauthorized - Invalid or missing JWT token',
        type: UnauthorizedResponseDto,
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Unauthorized',
            status_code: 401,
          },
        },
      }),
      ApiResponse({
        status: 500,
        description: 'Internal server error',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Failed to retrieve API keys',
            status_code: 500,
          },
        },
      }),
    );
  }

  static revokeApiKey() {
    return applyDecorators(
      ApiOperation({
        summary: 'Revoke API Key',
        description: 'Revoke an API key. Once revoked, the key cannot be used for authentication.',
      }),
      ApiBearerAuth('JWT-auth'),
      ApiResponse({
        status: 200,
        description: 'API key revoked successfully',
        schema: {
          example: {
            status: true,
            message: 'API key revoked successfully',
          },
        },
      }),
      ApiBadRequestResponse({
        description: 'API key is already revoked',
        type: BadResponseDto,
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'API key is already revoked',
            status_code: 400,
          },
        },
      }),
      ApiUnauthorizedResponse({
        description: 'Unauthorized - Invalid or missing JWT token',
        type: UnauthorizedResponseDto,
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Unauthorized',
            status_code: 401,
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'API key not found',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'API key not found',
            status_code: 404,
          },
        },
      }),
      ApiResponse({
        status: 500,
        description: 'Internal server error',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Failed to revoke API key',
            status_code: 500,
          },
        },
      }),
    );
  }
}

