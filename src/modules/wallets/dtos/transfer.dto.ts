import { IsNumber, IsPositive, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({ description: 'Recipient wallet number', example: '4566678954356' })
  @IsString()
  wallet_number: string;

  @ApiProperty({ description: 'Amount to transfer', example: 6001 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;
}

