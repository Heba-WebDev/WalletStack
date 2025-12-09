import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GoogleAuthDto } from '../dtos/google-auth.dto';
import {
  BadResponseDto,
  UnauthorizedResponseDto,
  ValidationResponseDto,
} from '@shared/docs-response.dto';

export class GoogleAuthDocs {
  static googleAuth() {
    return applyDecorators(
      ApiOperation({
        summary: 'Google OAuth login',
        description:
          'Authenticate users with Google OAuth2. Verifies the Google ID token and creates or updates the user account. Returns a JWT access token for subsequent requests.',
      }),
      ApiBody({ type: GoogleAuthDto }),
      ApiResponse({
        status: 200,
        description: 'Google authentication successful',
        schema: {
          example: {
            accessToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZjQ0ZmI1My00NTBjLTRiN2ItYmNiNy03ZmUzM2M1NmFkNjgiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJnb29nbGVJZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMzYwMH0',
            user: {
              id: '7f44fb53-450c-4b7b-bcb7-7fe33c56ad68',
              name: 'John Doe',
              email: 'user@example.com',
              googleId: '1234567890',
              avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
          },
        },
      }),
      ApiUnauthorizedResponse({
        description: 'Invalid Google ID token',
        type: UnauthorizedResponseDto,
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Invalid Google token',
            status_code: 401,
          },
        },
      }),
      ApiBadRequestResponse({
        description: 'Invalid request parameters or missing required fields',
        type: BadResponseDto,
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'Google token is missing required fields',
            status_code: 400,
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
            message: 'Failed to create user',
            status_code: 500,
          },
        },
      }),
    );
  }
}

