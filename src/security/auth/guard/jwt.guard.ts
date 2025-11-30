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
    console.log('User in JwtGuard:', request.user); // Agrega este log
    return super.canActivate(context);
  }
}
