import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { GoogleAuthService } from './services/google-auth.service';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
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
  providers: [AuthService, GoogleAuthService],
  exports: [AuthService],
})
export class AuthModule {}
