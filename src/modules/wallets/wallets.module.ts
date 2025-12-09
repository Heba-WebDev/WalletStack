import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './models/wallet.model';
import { WalletsModelAction } from './model-actions/wallet.model-action';
import { CoreWalletService } from './services/core-wallet.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet]),
    AuthModule,
  ],
  controllers: [WalletsController],
  providers: [WalletsService, CoreWalletService, WalletsModelAction],
  exports: [WalletsService],
})
export class WalletsModule {}
