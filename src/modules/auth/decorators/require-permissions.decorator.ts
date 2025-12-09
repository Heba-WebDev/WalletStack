import { SetMetadata } from '@nestjs/common';
import { ApiKeyPermission } from '../../api-keys/dtos/create-api-key.dto';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: ApiKeyPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

