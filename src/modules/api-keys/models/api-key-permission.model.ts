import { AbstractBaseEntity } from '@entities/base.entity';
import { ApiKey } from './api-key.model';
import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

@Entity({ name: 'api_key_permissions' })
export class ApiKeyPermission extends AbstractBaseEntity {
  @Column({ name: 'api_key_id', type: 'uuid' })
  apiKeyId: string;

  @ManyToOne(() => ApiKey, (apiKey) => apiKey.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'api_key_id' })
  apiKey: Relation<ApiKey>;

  @Index('idx_api_key_permissions_permission')
  @Column({ type: 'varchar', length: 50 })
  permission: string;
}

