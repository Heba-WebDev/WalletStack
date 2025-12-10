// core users service, inject model action
import { Injectable, HttpStatus } from '@nestjs/common';
import { UsersModelAction } from '../model-actions/users.model-action';
import { CreateUserDto } from '../dtos/create-user.dto';
import { DataSource } from 'typeorm';
import { User } from '../models/user.model';
import { CustomHttpException } from '@shared/custom.exception';
import { WalletsService } from 'src/modules/wallets/wallets.service';
import { WalletCurrency } from '@shared/enums';
import { generateWalletNumber } from '@helpers/wallet.helper';

@Injectable()
export class CoreUsersService {
  constructor(
    private usersModelAction: UsersModelAction,
    private datasource: DataSource,
    private walletsService: WalletsService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    return await this.datasource.transaction(async (transaction) => {
      const user = await this.usersModelAction.create({
        createPayload: {
          name: createUserDto.name,
          email: createUserDto.email,
          googleId: createUserDto.googleId,
          avatarUrl: createUserDto.avatarUrl,
        },
        transactionOptions: {
          useTransaction: true,
          transaction,
        },
      });
      if (!user) {
        throw new CustomHttpException(
          'Failed to create user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const wallet = await this.walletsService.createWallet(
        {
          number: generateWalletNumber(),
          currency: WalletCurrency.NGN,
          userId: user.id,
        },
        transaction,
      );

      if (!wallet) {
        throw new CustomHttpException(
          'Failed to create wallet',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return user;
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return await this.usersModelAction.get({ googleId });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersModelAction.get({ email });
  }

  async updateUser(
    id: string,
    payload: Partial<Pick<User, 'name' | 'avatarUrl' | 'email' | 'googleId'>>,
  ): Promise<User | null> {
    return await this.usersModelAction.update({
      identifierOptions: { id },
      updatePayload: payload,
    });
  }

  async findByIdWithWallet(id: string): Promise<User | null> {
    return await this.usersModelAction.get({ id }, {}, ['wallet']);
  }
}
