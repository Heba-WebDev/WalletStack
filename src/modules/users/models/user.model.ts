import { AbstractBaseEntity } from '@entities/base.entity';
import { Wallet } from 'src/modules/wallets/models/wallet.model';
import { Column, Entity, Index, OneToOne, Unique } from 'typeorm';

@Entity({ name: 'users' })
@Unique(['googleId'])
@Unique(['email'])
export class User extends AbstractBaseEntity {
  @Index('idx_users_google_id')
  @Column({ name: 'google_id', type: 'varchar', length: 255 })
  googleId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index('idx_user_email')
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true })
  avatarUrl?: string | null;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date | null;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;
}

