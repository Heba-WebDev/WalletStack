import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { Transaction } from '../models/transaction.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionsModelAction extends AbstractModelAction<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {
    super(transactionRepository, Transaction);
  }
}

