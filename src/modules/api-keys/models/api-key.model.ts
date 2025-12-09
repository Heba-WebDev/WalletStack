import { AbstractBaseEntity } from '@entities/base.entity';
import { User } from 'src/modules/users/models/user.model';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';
import { ApiKeyPermission } from './api-key-permission.model';

@Entity({ name: 'api_keys' })
export class ApiKey extends AbstractBaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Index('idx_api_keys_key_hash')
  @Column({ name: 'key_hash', type: 'varchar', length: 255, unique: true })
  keyHash: string;

  @Column({ name: 'key_prefix', type: 'varchar', length: 20 })
  keyPrefix: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => ApiKeyPermission, (permission) => permission.apiKey, {
    cascade: true,
  })
  permissions: Relation<ApiKeyPermission[]>;

  @Index('idx_api_keys_expires_at')
  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Index('idx_api_keys_revoked_at')
  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt?: Date | null;

  @Column({ name: 'parent_key_id', type: 'uuid', nullable: true })
  parentKeyId?: string | null;

  @ManyToOne(() => ApiKey, { nullable: true })
  @JoinColumn({ name: 'parent_key_id' })
  parentKey?: Relation<ApiKey> | null;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt?: Date | null;
}

