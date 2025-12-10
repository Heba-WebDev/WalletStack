import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import {
  BadResponseDto,
  UnauthorizedResponseDto,
  NotFoundResponseDto,
} from '@shared/docs-response.dto';

export class WalletsDocs {
  static getWalletNumber() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get Wallet Number',
        description:
          'Retrieve the wallet number and currency for the authenticated user. Requires READ permission.',
      }),
      ApiBearerAuth('JWT-auth'),
      ApiSecurity('API-Key-auth'),
      ApiResponse({
        status: 200,
        description: 'Wallet number retrieved successfully',
        schema: {
          example: {
            number: '4566678954356',
            currency: 'NGN',
          },
        },
      }),
      ApiUnauthorizedResponse({
        description: 'Unauthorized - Invalid or missing JWT token or API key',
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
      ApiNotFoundResponse({
        description: 'Wallet not found for the authenticated user',
        type: NotFoundResponseDto,
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Wallet not found',
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
            message: 'Failed to retrieve wallet number',
            status_code: 500,
          },
        },
      }),
    );
  }

  static getTransactions() {
    return applyDecorators(
      ApiOperation({
        summary: 'Get Transactions',
        description:
          'Retrieve paginated transaction history for the authenticated user. Returns transactions where the wallet is either sender or recipient. Requires READ permission.',
      }),
      ApiBearerAuth('JWT-auth'),
      ApiSecurity('API-Key-auth'),
      ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (starts from 1)',
        example: 1,
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page (1-100)',
        example: 20,
      }),
      ApiResponse({
        status: 200,
        description: 'Transactions retrieved successfully',
        schema: {
          example: {
            data: [
              {
                type: 'deposit',
                amount: 5000,
                status: 'success',
                reference: 'deposit_123e4567-e89b-12d3-a456-426614174000',
                description: 'Deposit of 5000',
                created_at: '2024-01-15T10:30:00.000Z',
              },
              {
                type: 'transfer',
                amount: 1000,
                status: 'success',
                reference: 'transfer_123e4567-e89b-12d3-a456-426614174001',
                description: 'Transfer from 4566678954356 to 7890123456789',
                created_at: '2024-01-14T14:20:00.000Z',
              },
            ],
            meta: {
              total: 45,
              page: 1,
              limit: 20,
              totalPages: 3,
            },
          },
        },
      }),
      ApiUnauthorizedResponse({
        description: 'Unauthorized - Invalid or missing JWT token or API key',
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
      ApiNotFoundResponse({
        description: 'Wallet not found for the authenticated user',
        type: NotFoundResponseDto,
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Wallet not found',
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
            message: 'Failed to retrieve transactions',
            status_code: 500,
          },
        },
      }),
    );
  }
}

