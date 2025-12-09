import { AbstractModelAction } from '@shared/abstract-model-action';
import { ApiKeyPermission } from '../models/api-key-permission.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ApiKeyPermissionModelAction extends AbstractModelAction<ApiKeyPermission> {
  constructor(
    @InjectRepository(ApiKeyPermission)
    repository: Repository<ApiKeyPermission>,
  ) {
    super(repository, ApiKeyPermission);
  }
}

