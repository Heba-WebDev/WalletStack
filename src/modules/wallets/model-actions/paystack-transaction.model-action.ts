import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '@shared/abstract-model-action';
import { PaystackTransaction } from '../models/paystack-transaction.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PaystackTransactionsModelAction extends AbstractModelAction<PaystackTransaction> {
  constructor(
    @InjectRepository(PaystackTransaction)
    private readonly paystackTransactionRepository: Repository<PaystackTransaction>,
  ) {
    super(paystackTransactionRepository, PaystackTransaction);
  }
}

