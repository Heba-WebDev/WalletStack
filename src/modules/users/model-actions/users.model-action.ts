import { AbstractModelAction } from '@shared/abstract-model-action';
import { User } from '../models/user.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersModelAction extends AbstractModelAction<User> {
  constructor(
    @InjectRepository(User) repository: Repository<User>,
  ) {
    super(repository, User);
  }
}
