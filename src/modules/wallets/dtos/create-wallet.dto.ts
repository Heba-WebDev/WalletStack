import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { WalletCurrency } from '@shared/enums';

export class CreateWalletDto {
  @IsNotEmpty()
  @IsString()
  number: string;

  @IsNotEmpty()
  @IsEnum(WalletCurrency)
  currency: WalletCurrency;

  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
