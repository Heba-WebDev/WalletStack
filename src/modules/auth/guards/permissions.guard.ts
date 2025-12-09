import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { ApiKeyPermission } from '../../api-keys/dtos/create-api-key.dto';
import { ApiKeysService } from '../../api-keys/api-keys.service';
import '../types/request.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private apiKeysService: ApiKeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      ApiKeyPermission[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // If JWT user (not API key), allow all operations
    if (request.user && !request.apiKey) {
      return true;
    }

    // If API key, check permissions
    if (request.apiKey) {
      const apiKey = request.apiKey; // Type narrowing
      const hasAllPermissions = requiredPermissions.every((permission) =>
        this.apiKeysService.hasPermission(apiKey, permission),
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException(
          `API key missing required permissions: ${requiredPermissions.join(', ')}`,
        );
      }

      return true;
    }

    // Should not reach here if CombinedAuthGuard is used
    throw new ForbiddenException('Authentication required');
  }
}

