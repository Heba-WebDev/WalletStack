import { IsNumber, IsPositive, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({ description: 'Recipient wallet number', example: '4566678954356' })
  @IsString()
  wallet_number: string;

  @ApiProperty({ 
    description: 'Amount to transfer in main currency unit (NGN). Will be stored in smallest unit (kobo) for accuracy.', 
    example: 6001 
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number; // Amount in NGN (main currency unit)
}

