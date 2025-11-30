import {
  ConflictException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.user[data];
    }
    // otherwise continue
    return request.user;
  },
);

export const GetUserAdmin = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    const user: Partial<User> =  request.user;
    console.log(request.user)

    if (user) { // Propietario
  return user;
} else {
  throw new ConflictException('El usuario no tiene permisos para ejecutar esta acción');
}
},
);

export const GetUserEmployee = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    const user: Partial<User> = request.user;

    // Verifica si el ID del rol del usuario es 2
    // if (user && user.role.id === 2) {
      return user;
    // } else {
      // throw new ConflictException('El usuario no es empleado.');
    // }
  },
);

export const GetUserEntity = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    const user: Partial<User> = request.user;
    // Verifica si el ID del rol del usuario es 3
    if (user) {
      return user;
    } // else {
      // throw new ConflictException('El usuario no es cliente.');
    // }
  },
);
