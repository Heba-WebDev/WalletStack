import { HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { WalletsModelAction } from '../model-actions/wallet.model-action';
import { CreateWalletDto } from '../dtos/create-wallet.dto';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class CoreWalletService {
  constructor(
    private walletsModelAction: WalletsModelAction,
  ) {}

  async createWallet(createWalletDto: CreateWalletDto, transaction?: EntityManager) {
    const createWithManager = async (manager: EntityManager) => {
      return await this.walletsModelAction.create({
        createPayload: createWalletDto,
        transactionOptions: {
          useTransaction: true,
          transaction: manager,
        },
      });
    };

    const wallet = transaction
      ? await createWithManager(transaction)
      : await this.walletsModelAction.transaction(async (manager) =>
          createWithManager(manager),
        );

    if (!wallet) {
      throw new CustomHttpException('Failed to create wallet', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return wallet;
  }

}