import { Injectable } from '@nestjs/common';
import { AuditLogModelAction } from './model-actions/audit-log.model-action';
import {
  AuditLogActionType,
  AuditLogActorType,
} from './models/audit-log.model';
import { EntityManager } from 'typeorm';

export interface CreateAuditLogParams {
  actorType: AuditLogActorType;
  actorId: string | null;
  actionType: AuditLogActionType;
  targetEntity: string;
  targetId: string | null;
  metadata?: Record<string, any>;
  transaction?: EntityManager;
}

@Injectable()
export class AuditLogsService {
  constructor(
    private readonly auditLogModelAction: AuditLogModelAction,
  ) {}

  async createAuditLog(params: CreateAuditLogParams): Promise<void> {
    const {
      actorType,
      actorId,
      actionType,
      targetEntity,
      targetId,
      metadata,
      transaction,
    } = params;

    const createPayload = {
      actorType,
      actorId,
      actionType,
      targetEntity,
      targetId,
      metadata: metadata || null,
    };

    if (transaction) {
      await this.auditLogModelAction.create({
        createPayload,
        transactionOptions: {
          useTransaction: true,
          transaction,
        },
      });
    } else {
      await this.auditLogModelAction.create({
        createPayload,
      });
    }
  }

  async logTransactionAction(
    actorType: AuditLogActorType,
    actorId: string | null,
    actionType: AuditLogActionType,
    transactionId: string,
    metadata?: Record<string, any>,
    transaction?: EntityManager,
  ): Promise<void> {
    await this.createAuditLog({
      actorType,
      actorId,
      actionType,
      targetEntity: 'transaction',
      targetId: transactionId,
      metadata,
      transaction,
    });
  }
}

