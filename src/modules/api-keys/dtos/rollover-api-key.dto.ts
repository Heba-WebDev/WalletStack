import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiKeyExpiry } from './create-api-key.dto';

export class RolloverApiKeyDto {
  @ApiProperty({
    description: 'ID of the expired API key to rollover',
    example: '7f44fb53-450c-4b7b-bcb7-7fe33c56ad68',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  expiredKeyId: string;

  @ApiProperty({
    description: 'New expiry duration for the rolled over API key. Options: 1H (1 hour), 1D (1 day), 1M (1 month), 1Y (1 year)',
    example: '1M',
    enum: ApiKeyExpiry,
  })
  @IsEnum(ApiKeyExpiry)
  @IsNotEmpty()
  expiry: ApiKeyExpiry;
}

