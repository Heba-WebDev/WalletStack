import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { Wallet } from '../models/wallet.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WalletsModelAction extends AbstractModelAction<Wallet> {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {
    super(walletRepository, Wallet);
  }
}
