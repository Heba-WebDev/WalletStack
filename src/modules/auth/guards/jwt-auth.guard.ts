import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  googleId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new UnauthorizedException('JWT secret not configured');
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      request.user = {
        id: payload.sub,
        email: payload.email,
        googleId: payload.googleId,
        sub: payload.sub,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Check both 'authorization' and 'Authorization' headers (Express may lowercase)
    const authHeader =
      request.headers.authorization || request.headers['Authorization'];
    
    if (!authHeader) {
      return undefined;
    }

    // Handle case where header might be an array
    const authHeaderStr = Array.isArray(authHeader) ? authHeader[0] : authHeader;

    const parts = authHeaderStr.split(' ');
    
    if (parts.length >= 2 && parts[0].toLowerCase() === 'bearer') {
      return parts.slice(1).join(' ').trim();
    }
  
    return authHeaderStr.trim();
  }
}

