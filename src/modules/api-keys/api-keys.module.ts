import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './models/api-key.model';
import { ApiKeyPermission } from './models/api-key-permission.model';
import { ApiKeyModelAction } from './model-actions/api-key.model-action';
import { ApiKeyPermissionModelAction } from './model-actions/api-key-permission.model-action';
import { CoreApiKeysService } from './services/core-api-keys.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey, ApiKeyPermission]),
    AuthModule,
  ],
  controllers: [ApiKeysController],
  providers: [
    ApiKeysService,
    CoreApiKeysService,
    ApiKeyModelAction,
    ApiKeyPermissionModelAction,
  ],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}

