import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuditLogActorType } from '../../audit-logs/models/audit-log.model';
import '../types/request.types';

export interface CurrentActorInfo {
  actorType: AuditLogActorType;
  actorId: string | null;
}

export const CurrentActor = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentActorInfo => {
    const request = ctx.switchToHttp().getRequest<Request>();
    
    // Check if API key was used
    if (request.apiKey) {
      return {
        actorType: AuditLogActorType.API_KEY,
        actorId: request.apiKey.id,
      };
    }
    
    // Otherwise, it's a user (JWT)
    if (request.user) {
      return {
        actorType: AuditLogActorType.USER,
        actorId: request.user.id,
      };
    }
    
    // Fallback (shouldn't happen if guards are working)
    return {
      actorType: AuditLogActorType.USER,
      actorId: null,
    };
  },
);

