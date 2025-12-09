import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ApiKeyExpiry {
  ONE_HOUR = '1H',
  ONE_DAY = '1D',
  ONE_MONTH = '1M',
  ONE_YEAR = '1Y',
}

export enum ApiKeyPermission {
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
  READ = 'read',
}

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'User-friendly name for the API key',
    example: 'wallet-service',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Array of permissions for the API key. Must include at least one permission. Valid values: deposit, transfer, read',
    example: ['deposit', 'transfer', 'read'],
    enum: ApiKeyPermission,
    isArray: true,
    type: [String],
    enumName: 'ApiKeyPermission',
  })
  @IsArray({ message: 'permissions must be an array' })
  @ArrayMinSize(1, { message: 'permissions array must contain at least one permission' })
  @IsEnum(ApiKeyPermission, {
    each: true,
    message: 'Each permission must be one of: deposit, transfer, read',
  })
  permissions: ApiKeyPermission[];

  @ApiProperty({
    description: 'Expiry duration for the API key. Options: 1H (1 hour), 1D (1 day), 1M (1 month), 1Y (1 year)',
    example: '1D',
    enum: ApiKeyExpiry,
  })
  @IsEnum(ApiKeyExpiry)
  @IsNotEmpty()
  expiry: ApiKeyExpiry;
}

