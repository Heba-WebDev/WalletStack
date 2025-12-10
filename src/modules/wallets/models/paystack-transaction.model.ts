import { AbstractBaseEntity } from '@entities/base.entity';
import { WalletCurrency } from '@shared/enums';
import { Transaction } from './transaction.model';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  Unique,
} from 'typeorm';

@Entity({ name: 'paystack_transactions' })
@Unique(['paystackReference'])
export class PaystackTransaction extends AbstractBaseEntity {
  @Index('idx_paystack_transactions_transaction_id')
  @Column({ name: 'transaction_id', type: 'uuid' })
  transactionId: string;

  @Index('idx_paystack_transactions_reference')
  @Unique(['paystackReference'])
  @Column({ name: 'paystack_reference', type: 'varchar', length: 255 })
  paystackReference: string;

  @Column({
    name: 'paystack_transaction_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  paystackTransactionId: string | null;

  @Column({
    name: 'authorization_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  authorizationUrl: string | null;

  @Column({
    name: 'paystack_status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  paystackStatus: string | null;

  @Index('idx_paystack_transactions_webhook_received')
  @Column({ name: 'webhook_received', type: 'boolean', default: false })
  webhookReceived: boolean;

  @Column({
    name: 'webhook_processed_at',
    type: 'timestamp',
    nullable: true,
  })
  webhookProcessedAt: Date | null;

  @Column({
    name: 'webhook_signature',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  webhookSignature: string | null;

  @Column({
    name: 'amount',
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  amount: number; // Stored in smallest currency unit (kobo for NGN)

  @Column({
    name: 'currency',
    type: 'enum',
    enum: WalletCurrency,
    default: WalletCurrency.NGN,
  })
  currency: WalletCurrency;

  @Column({
    name: 'customer_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  customerEmail: string | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @OneToOne(() => Transaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;
}

