import { Injectable } from '@nestjs/common';
import { CoreWalletService } from './services/core-wallet.service';
import { CreateWalletDto } from './dtos/create-wallet.dto';
import { EntityManager } from 'typeorm';

@Injectable()
export class WalletsService {
    constructor(
        private readonly coreWalletService: CoreWalletService,
    ) {}

  async createWallet(createWalletDto: CreateWalletDto, transaction?: EntityManager) {
      return await this.coreWalletService.createWallet(createWalletDto, transaction);
    }
}
