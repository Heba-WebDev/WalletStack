import { AbstractBaseEntity } from '@entities/base.entity';
import { TransactionType, TransactionStatus } from '@shared/enums';
import { Wallet } from './wallet.model';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';

@Entity({ name: 'transactions' })
@Unique(['reference'])
export class Transaction extends AbstractBaseEntity {
  @Column({
    name: 'type',
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

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
    name: 'status',
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Index('idx_transactions_reference')
  @Column({ name: 'reference', type: 'varchar', length: 255, nullable: true })
  reference: string | null;

  @Index('idx_transactions_sender_wallet_id')
  @Column({ name: 'sender_wallet_id', type: 'uuid', nullable: true })
  senderWalletId: string | null;

  @Index('idx_transactions_recipient_wallet_id')
  @Column({ name: 'recipient_wallet_id', type: 'uuid' })
  recipientWalletId: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => Wallet, { nullable: true })
  @JoinColumn({ name: 'sender_wallet_id' })
  senderWallet: Wallet | null;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'recipient_wallet_id' })
  recipientWallet: Wallet;
}

