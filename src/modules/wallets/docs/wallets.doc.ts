import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
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
      ApiHeader({
        name: 'x-api-key',
        description: 'API Key for service-to-service access (alternative to JWT)',
        required: false,
      }),
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
}

