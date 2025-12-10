import { AbstractBaseEntity } from '@entities/base.entity';
import { ApiKey } from '../../api-keys/models/api-key.model';
import { User } from '../../users/models/user.model';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export enum AuditLogActionType {
  DEPOSIT_CREATED = 'deposit_created',
  DEPOSIT_SUCCESS = 'deposit_success',
  DEPOSIT_FAILED = 'deposit_failed',
  TRANSFER_CREATED = 'transfer_created',
  TRANSFER_SUCCESS = 'transfer_success',
  TRANSFER_FAILED = 'transfer_failed',
  WEBHOOK_RECEIVED = 'webhook_received',
  WEBHOOK_PROCESSED = 'webhook_processed',
}

export enum AuditLogActorType {
  USER = 'user',
  API_KEY = 'api_key',
}

@Entity({ name: 'audit_logs' })
export class AuditLog extends AbstractBaseEntity {
  @Index('idx_audit_logs_actor_type')
  @Column({
    name: 'actor_type',
    type: 'enum',
    enum: AuditLogActorType,
  })
  actorType: AuditLogActorType;

  @Index('idx_audit_logs_actor_id')
  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null;

  // Note: actor_id can reference either users or api_keys
  // Foreign key constraints are handled at application level
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_id' })
  actorUser?: User | null;

  @ManyToOne(() => ApiKey, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_id' })
  actorApiKey?: ApiKey | null;

  @Index('idx_audit_logs_action_type')
  @Column({
    name: 'action_type',
    type: 'enum',
    enum: AuditLogActionType,
  })
  actionType: AuditLogActionType;

  @Index('idx_audit_logs_target_entity')
  @Column({ name: 'target_entity', type: 'varchar', length: 100 })
  targetEntity: string; // e.g., 'transaction', 'wallet', 'api_key'

  @Index('idx_audit_logs_target_id')
  @Column({ name: 'target_id', type: 'uuid', nullable: true })
  targetId: string | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}

