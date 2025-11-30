import { Controller } from '@nestjs/common';
import { BaseControllerCRUD } from 'src/common/base/class/base.controller.crud.class';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto, UpdateUserWithRolesDto } from './dto';
import { UserService } from './user.service';
import { IdDto } from 'src/common/base/dto/id.dto';
import {
  Body,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateTrazaDto } from '../trazas/dto/create-traza.dto';
import { RouteAccessGuard } from 'src/common/guards/route-access.guard';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from './entities/user.entity';

@ApiTags('user')
@Controller('usuarios')
export class UserController extends BaseControllerCRUD<
CreateUserDto,
UpdateUserDto,
UserService
> {
  constructor(private readonly Service: UserService) {
    super(Service);
  }

  @Get('todos')
  override async findItems() {
    return super.findItems();
  }

  @UseGuards(RouteAccessGuard)
  @Get(['ver-todos-activos-secure'])
  override async findActiveItems() {
    return super.findActiveItems();
  }

  @UseGuards(JwtGuard)
  @Post('adicionar')
  @ApiOperation({ summary: 'Crear un nuevo item en user' })
  @ApiResponse({ status: 200, description: 'Item creado exitosamente,returnDto.data={object saved}' })
  @ApiResponse({ status: 400, description: 'Datos inválidos proporcionados' })
  async Add(
    @Body(new ValidationPipe({ transform: true })) createDto: CreateUserDto,
    @Req() request: Request,  
    @GetUser() user: User
  ) {
    // Obtener la IP del cliente
    const clientIp = request.socket.remoteAddress; // Usar socket.remoteAddress en lugar de connection.remoteAddress
    const ipv4 = clientIp?.replace('::ffff:', ''); // Extraer la parte IPv4 si está en formato IPv6
    // Obtener la URL que se ejecutó
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    const { rules, ...trazaSinRules } = createDto;
    traza.traza = trazaSinRules; // Asignar la traza sin la propiedad 'rules'
    return await this.Service.Add(createDto, traza);
  }

  // @UseGuards(JwtGuard)
  @Patch('editar')
  @ApiOperation({ summary: 'Actualizar un item existente en user' })
  @ApiResponse({ status: 200, description: 'Item actualizado exitosamente,returnDto.data={object updated} ' })
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async Edit(
    @Body(new ValidationPipe({ transform: true })) updateDto: UpdateUserDto,
    @Req() request: Request,
    @GetUser() user: User
  ) {
    // Obtener la IP del cliente
    const clientIp = request.socket.remoteAddress; // Usar socket.remoteAddress en lugar de connection.remoteAddress
    const ipv4 = clientIp?.replace('::ffff:', ''); // Extraer la parte IPv4 si está en formato IPv6
    // Obtener la URL que se ejecutó
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    const { rules, ...trazaSinRules } = updateDto;
    traza.traza = trazaSinRules; // Asignar la traza sin la propiedad 'rules'
    return await this.Service.Edit(updateDto, traza);
  }

  // @UseGuards(JwtGuard)
  @Put('cambiar-estado')
  @ApiOperation({ summary: 'Activar/Desactivar un item de user' })
  @ApiResponse({ status: 200, description: 'Item activado/desactivado exitosamente,returnDto.data={object active/inactive}  '})
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async State(@Body(new ValidationPipe({ transform: true })) dto: IdDto,
  @Req() request: Request,
  @GetUser() user: User
  ) {

    // Obtener la IP del cliente
    const clientIp = request.socket.remoteAddress; // Usar socket.remoteAddress en lugar de connection.remoteAddress
    const ipv4 = clientIp?.replace('::ffff:', ''); // Extraer la parte IPv4 si está en formato IPv6
    // Obtener la URL que se ejecutó
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    traza.traza = dto; // Asignar la traza sin la propiedad 'rules'

    // Llamar al método create de la clase base, pasando el request  
    return await this.Service.State(dto, traza);
  }

  // @UseGuards(JwtGuard)
  @Delete('eliminar')
  @ApiOperation({ summary: 'Eliminar un item de user' })
  @ApiResponse({ status: 200, description: 'Item eliminado exitosamente,returnDto.data={object deleted}' })
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async Delete(@Body(new ValidationPipe({ transform: true })) dto: IdDto,
  @Req() request: Request,
  @GetUser() user: User
  ) {
    // Obtener la IP del cliente
    const clientIp = request.socket.remoteAddress; // Usar socket.remoteAddress en lugar de connection.remoteAddress
    const ipv4 = clientIp?.replace('::ffff:', ''); // Extraer la parte IPv4 si está en formato IPv6
    // Obtener la URL que se ejecutó
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    traza.traza = dto; // Asignar la traza sin la propiedad 'rules'

    // Llamar al método delete de la clase base, pasando el request  
    return await this.Service.Delete(dto, traza);
  }
}