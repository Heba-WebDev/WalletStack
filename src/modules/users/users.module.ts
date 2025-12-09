import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CoreUsersService } from './services/core-users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModelAction } from './model-actions/users.model-action';
import { User } from './models/user.model';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => WalletsModule)],
  controllers: [UsersController],
  providers: [UsersService, CoreUsersService, UsersModelAction],
  exports: [UsersService],
})
export class UsersModule {}
