import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({ 
    description: 'Amount to deposit in main currency unit (NGN). Will be stored in smallest unit (kobo) for accuracy.', 
    example: 5000 
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;
}

