import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { GoogleAuthService } from './services/google-auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { CombinedAuthGuard } from './guards/combined-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    ApiKeysModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') ?? '1d';
        
        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }

        const options: JwtModuleOptions = {
          secret,
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
        return options;
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleAuthService,
    JwtAuthGuard,
    ApiKeyGuard,
    CombinedAuthGuard,
    PermissionsGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    ApiKeyGuard,
    CombinedAuthGuard,
    PermissionsGuard,
    JwtModule,
  ],
})
export class AuthModule {}
