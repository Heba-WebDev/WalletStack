import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './models/wallet.model';
import { Transaction } from './models/transaction.model';
import { PaystackTransaction } from './models/paystack-transaction.model';
import { WalletsModelAction } from './model-actions/wallet.model-action';
import { TransactionsModelAction } from './model-actions/transaction.model-action';
import { PaystackTransactionsModelAction } from './model-actions/paystack-transaction.model-action';
import { CoreWalletService } from './services/core-wallet.service';
import { PaystackService } from './services/paystack.service';
import { AuthModule } from '../auth/auth.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction, PaystackTransaction]),
    ConfigModule,
    forwardRef(() => AuthModule),
    forwardRef(() => ApiKeysModule),
  ],
  controllers: [WalletsController],
  providers: [
    WalletsService,
    CoreWalletService,
    WalletsModelAction,
    TransactionsModelAction,
    PaystackTransactionsModelAction,
    PaystackService,
  ],
  exports: [WalletsService],
})
export class WalletsModule {}
