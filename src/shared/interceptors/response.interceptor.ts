import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  status: boolean;
  status_code: number;
  data: T;
  message?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data) => {
        // If data already has status and status_code, return as is (for error responses)
        if (data && typeof data === 'object' && 'status' in data && 'status_code' in data) {
          return data;
        }

        // Handle special case where accessToken should be at top level
        if (data && typeof data === 'object' && 'accessToken' in data) {
          const { accessToken, ...rest } = data;
          return {
            status: statusCode >= 200 && statusCode < 300,
            status_code: statusCode,
            accessToken,
            data: rest || null,
          };
        }

        // Wrap successful responses
        return {
          status: statusCode >= 200 && statusCode < 300,
          status_code: statusCode,
          data: data || null,
        };
      }),
    );
  }
}

