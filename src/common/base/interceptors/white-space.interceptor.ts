import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ClearWhiteSpaceInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const { body } = request;
    if (body && Object.keys(body).length) {
      const check = (data: any) => {
        if (data) {
          if (typeof data === 'object') {
            Object.keys(data).forEach((key) => {
              if (data[key]) {
                if (typeof data[key] === 'string') {
                  data[key] = data[key].trim();
                }
                if (typeof data[key] === 'object') {
                  check(data[key]);
                }
              }
            });
          }
          if (typeof data === 'string') {
            data = data.trim();
          }
        }
      };
      check(body);
    }
    return next.handle();
  }
}
