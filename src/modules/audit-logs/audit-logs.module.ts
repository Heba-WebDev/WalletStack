import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './models/audit-log.model';
import { AuditLogModelAction } from './model-actions/audit-log.model-action';
import { AuditLogsService } from './audit-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditLogModelAction, AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}

