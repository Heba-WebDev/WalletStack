// wallet model
import { AbstractBaseEntity } from '@entities/base.entity';
import { WalletCurrency } from '@shared/enums';
import { User } from 'src/modules/users/models/user.model';
import { Column, Entity, Index, JoinColumn, OneToOne, Unique } from 'typeorm';

@Entity({ name: 'wallets' })
@Unique(['number'])
@Unique(['userId'])
export class Wallet extends AbstractBaseEntity {
  @Index('idx_wallet_number')
  @Column({ name: 'number', type: 'varchar', length: 255 })
  number: string;

  @Column({
    name: 'balance',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  balance: number;

  @Column({ name: 'currency', type: 'enum', enum: WalletCurrency })
  currency: WalletCurrency;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
