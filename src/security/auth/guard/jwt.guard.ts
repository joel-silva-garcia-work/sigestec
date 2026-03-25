import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isPublic = Reflect.getMetadata('isPublic', context.getHandler());
    if (isPublic) {
      return true; // Permite el acceso sin autenticación
    }
    return super.canActivate(context);
  }
}
