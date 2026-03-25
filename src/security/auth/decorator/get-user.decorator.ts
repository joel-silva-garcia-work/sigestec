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

export const GetUserTech = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    const user: Partial<User> =  request.user;
    if ((user && user.rol.id === "86e1985c-576c-4129-b81c-c88270fe9c42" ||
                  user.rol.id === "4252bf9a-b5f9-4c62-b146-e8977b79431e")){// Tecnico

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

export const GetUserManager = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    const user: Partial<User> =  request.user;
    if ((user && user.rol.id === "019bd3ad-aecd-4607-b469-8f8ea90dcb3f" ||
                 user.rol.id === "4252bf9a-b5f9-4c62-b146-e8977b79431e"
    )){// Jefe de Taller

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
    if ((user && user.rol.id === "4252bf9a-b5f9-4c62-b146-e8977b79431e")){// Administrador

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


