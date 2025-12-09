import { ApiProperty } from '@nestjs/swagger';

class ValidationErrors {
  @ApiProperty({
    example: [
      'password is not strong enough',
      'password must be longer than or equal to 8 characters',
    ],
  })
  password?: string[];

  @ApiProperty({ example: ['Username is required'] })
  username?: string[];
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Bad Request' })
  message: string;
}

export class BadResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Bad Request' })
  message: string;
}

export class UnauthorizedResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Invalid authentication token' })
  message: string;
}

export class ForbiddenResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Forbidden - Bad Request' })
  message: string;
}

export class TooManyRequestsDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Too many requests' })
  message: string;
}

export class ValidationResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Validation error' })
  message: string;

  @ApiProperty({ type: ValidationErrors })
  errors: ValidationErrors;
}

export class NotFoundResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Resource Not found' })
  message: string;
}

export class InternalServerErrorDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Internal server error' })
  message: string;
}

import { Type } from '@nestjs/common';

export function DocsResponseDto<T>(
  model: Type<T>,
  extraProperties?: Record<string, any>,
): Type<any> {
  class DocsResponse {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Operation successful' })
    message: string;

    @ApiProperty({ type: model })
    data: T;

    constructor() {
      this.success = true;
      this.message = 'Operation successful';
      this.data = {} as T;
    }
  }

  if (extraProperties) {
    for (const key in extraProperties) {
      if (Object.prototype.hasOwnProperty.call(extraProperties, key)) {
        ApiProperty({ example: extraProperties[key] })(
          DocsResponse.prototype,
          'data',
        );
      }
    }
  }

  return DocsResponse;
}

