import { Injectable } from '@nestjs/common';
import { CoreWalletService } from './services/core-wallet.service';
import { CreateWalletDto } from './dtos/create-wallet.dto';
import { EntityManager } from 'typeorm';

@Injectable()
export class WalletsService {
  constructor(
    private readonly coreWalletService: CoreWalletService,
  ) {}

  async createWallet(
    createWalletDto: CreateWalletDto,
    transaction?: EntityManager,
  ) {
    return await this.coreWalletService.createWallet(
      createWalletDto,
      transaction,
    );
  }

  // TODO: Implement these methods
  async deposit(userId: string, amount: number) {
    // Implement Paystack deposit initialization
    throw new Error('Not implemented');
  }

  async getBalance(userId: string) {
    // Implement balance retrieval
    throw new Error('Not implemented');
  }

  async transfer(userId: string, walletNumber: string, amount: number) {
    // Implement wallet-to-wallet transfer
    throw new Error('Not implemented');
  }

  async getTransactions(userId: string) {
    // Implement transaction history retrieval
    throw new Error('Not implemented');
  }

  async getDepositStatus(userId: string, reference: string) {
    // Implement deposit status check (read-only, no wallet crediting)
    throw new Error('Not implemented');
  }

  async handlePaystackWebhook(webhookData: any) {
    // Implement Paystack webhook handling
    throw new Error('Not implemented');
  }
}
