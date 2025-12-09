import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token from the client (accepts both idToken and id_token)',
    example:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTAiLCJ0eXAiOiJKV1QifQ...',
  })
  @Transform(({ obj }) => obj.idToken || obj.id_token)
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

