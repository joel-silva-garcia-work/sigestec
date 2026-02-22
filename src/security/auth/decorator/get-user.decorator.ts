import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { ReturnDto } from '../../../common/base/dto';

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

export const GetUserRegistered = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    const user: Partial<User> =  request.user;
    if (user) 
    { // cualquie usuario registrado
      return user;
    } 
    else {
      const returnDto = new ReturnDto()
      returnDto.isSuccess = false;
      returnDto.errorMessage =('El usuario no tiene permisos para ejecutar esta acción');
      return returnDto
    }
  },
);


export const GetUserAdmin= createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    const user: Partial<User> =  request.user;
    if ((user && user.rol.id === "dc3ab524-d911-4f8a-93a6-5ab0a524f2bc")){// Administrador

      return user;
    } 
    else {
      const returnDto = new ReturnDto()
      returnDto.isSuccess = false;
      returnDto.errorMessage =('El usuario no tiene permisos para ejecutar esta acción');
      return returnDto
    }
  },
);


