import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '@database/data-source';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { WalletsModule } from './modules/wallets/wallets.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...dataSourceOptions,
      }),
    }),
    UsersModule,
    AuthModule,
    WalletsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

