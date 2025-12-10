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
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    return applyDecorators(
      ApiOperation({
        summary: 'Google OAuth login (POST /auth/google/token)',
        description: `Authenticate users with Google OAuth2 by posting the Google ID token to **${baseUrl}/v1/auth/google/token**. Verifies the token and creates/updates the user, returning a JWT for subsequent requests.`,
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

  static googleAuthRedirect() {
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/v1/auth/google`;
    return applyDecorators(
      ApiOperation({
        summary: 'Initiate Google OAuth Redirect',
        description:
          `Redirects the user to Google OAuth consent page. Open <a href="${redirectUrl}" target="_blank" rel="noreferrer">${redirectUrl}</a> in a browser to begin; after consent, Google redirects to /auth/google/callback. **Note:** This endpoint returns a 302 redirect and cannot be tested directly in Swagger UI. Use a browser or follow redirects with curl.`,
      }),
      ApiResponse({
        status: 302,
        description: 'Redirects to Google OAuth consent page',
        headers: {
          Location: {
            description: 'Google OAuth authorization URL',
            schema: {
              type: 'string',
              example: 'https://accounts.google.com/o/oauth2/v2/auth?...',
            },
          },
        },
      }),
      ApiResponse({
        status: 500,
        description: 'GOOGLE_CLIENT_SECRET not configured',
        schema: {
          example: {
            success: false,
            status: 'error',
            message: 'GOOGLE_CLIENT_SECRET is required for OAuth redirect flow',
            status_code: 500,
          },
        },
      }),
    );
  }

  static googleAuthCallback() {
    return applyDecorators(
      ApiOperation({
        summary: 'Google OAuth Callback',
        description:
          'Handles the callback from Google OAuth after user authorization. This endpoint is called by Google with an authorization code. It exchanges the code for tokens, verifies the ID token, creates/updates the user, and returns a JWT. **Note:** This endpoint is typically called by Google, not directly by clients.',
      }),
      ApiResponse({
        status: 200,
        description: 'Google authentication successful',
        schema: {
          example: {
            accessToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZjQ0ZmI1My00NTBjLTRiN2ItYmNiNy03ZmUzM2M1NmFkNjgiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJnb29nbGVJZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMzYwMH0',
            data: {
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
        },
      }),
      ApiBadRequestResponse({
        description: 'Authorization code is missing',
        schema: {
          example: {
            message: 'Authorization code is required',
          },
        },
      }),
      ApiUnauthorizedResponse({
        description: 'Authentication failed',
        schema: {
          example: {
            message: 'Authentication failed',
          },
        },
      }),
    );
  }
}

