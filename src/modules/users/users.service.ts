import { Injectable } from '@nestjs/common';
import { CoreUsersService } from './services/core-users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(
    private readonly coreUsersService: CoreUsersService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    return await this.coreUsersService.createUser(createUserDto);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.coreUsersService.findByGoogleId(googleId);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.coreUsersService.findByEmail(email);
  }

  async updateUser(
    id: string,
    payload: Partial<Pick<User, 'name' | 'avatarUrl' | 'email' | 'googleId'>>,
  ): Promise<User | null> {
    return this.coreUsersService.updateUser(id, payload);
  }

  async findByIdWithWallet(id: string): Promise<User | null> {
    return this.coreUsersService.findByIdWithWallet(id);
  }
}
