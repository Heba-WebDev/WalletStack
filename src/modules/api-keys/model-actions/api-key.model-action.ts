import { AbstractModelAction } from '@shared/abstract-model-action';
import { ApiKey } from '../models/api-key.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ApiKeyModelAction extends AbstractModelAction<ApiKey> {
  constructor(
    @InjectRepository(ApiKey) repository: Repository<ApiKey>,
  ) {
    super(repository, ApiKey);
  }
}

