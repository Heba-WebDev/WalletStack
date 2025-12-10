import { AbstractModelAction } from '@shared/abstract-model-action';
import { AuditLog } from '../models/audit-log.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuditLogModelAction extends AbstractModelAction<AuditLog> {
  constructor(
    @InjectRepository(AuditLog) repository: Repository<AuditLog>,
  ) {
    super(repository, AuditLog);
  }
}

