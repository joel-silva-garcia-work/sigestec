import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtGuard } from 'src/security/auth/guard';

@Injectable()
export class RouteAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): any {
    const request = context.switchToHttp().getRequest();
    const path = request.route.path;

    // Si la ruta termina en 'public', permitir acceso
    if (path.endsWith('public')) {
      return true;
    }

    // Para rutas seguras, usar el JwtGuard
    const jwtGuard = new JwtGuard();
    return jwtGuard.canActivate(context);
  }
} 