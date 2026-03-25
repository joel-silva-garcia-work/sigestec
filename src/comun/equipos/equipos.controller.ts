import { Controller, Patch, Post } from '@nestjs/common';
import { BaseControllerCRUD } from 'src/common/base/class/base.controller.crud.class';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiBody } from '@nestjs/swagger';
import { CreateEquiposDto, UpdateEquiposDto } from './dto';
import { EquiposService } from './equipos.service';
import { IdDto } from 'src/common/base/dto/id.dto';
import { CreateTrazaDto } from 'src/security/trazas/dto/create-traza.dto';
import { 
  Body,
  Get,
  Put,
  ValidationPipe,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from 'src/security/auth/guard';
import { RouteAccessGuard } from 'src/common/guards/route-access.guard';
import { ReturnDto } from 'src/common/base/dto';
import { GetUserManager } from 'src/security/auth/decorator';
import { User } from 'src/security/user/entities/user.entity';

@ApiTags('equipos')
@Controller('comun/equipos')
export class EquiposController extends BaseControllerCRUD<
CreateEquiposDto,
UpdateEquiposDto,
EquiposService
> {
  constructor(private readonly Service: EquiposService) {
    super(Service);
  }

     @Get('todos')
    override async findItems() {
      return super.findItems();
    }
  
  @UseGuards(RouteAccessGuard)
  @Get(['ver-todos-activos-secure', 'ver-todos-activos-public'])
    override async findActiveItems(
    // @GetUserAdmin() user: User
    ) {
      return super.findActiveItems();
    }

  @UseGuards(RouteAccessGuard)
  @Get(['ver-uno-secure', 'ver-uno-public'])  
  @ApiOperation({ summary: 'Obtener un item por ID' })
  @ApiResponse({
    status: 200,
    description: 'Item obtenido exitosamente',
  })
  @ApiBadRequestResponse({
    description: 'Error de validación o datos incorrectos.',
  })
  @ApiBody({ type: IdDto, description: 'ID del elemento a buscar.' })
  override async findOne(@Body(new ValidationPipe({ transform: true })) dto: IdDto, securityParam?: any): Promise<ReturnDto> {
    return this.Service.findOne(dto);
  }
  
  
  @UseGuards(RouteAccessGuard)
  @Get(['ver-uno-activo-secure', 'ver-uno-activo-public'])  
  @ApiOperation({ summary: 'Obtener un item por ID' })
  @ApiResponse({
    status: 200,
    description: 'Item obtenido exitosamente',
    type: ReturnDto,
  })
  @ApiBadRequestResponse({
    description: 'Error de validación o datos incorrectos.',
  })
  @ApiBody({ type: IdDto, description: 'ID del elemento a buscar.' })
  override async findOneActive(@Body(new ValidationPipe({ transform: true })) dto: IdDto, securityParam?: any): Promise<ReturnDto> {
    return this.Service.findOneActive(dto);
  }

  @UseGuards(JwtGuard)
  @Post('adicionar')
  @ApiOperation({ summary: 'Crear un nuevo item en equipos' })
  @ApiResponse({ status: 200, description: 'Item creado exitosamente,returnDto.data={object saved}' })
  @ApiResponse({ status: 400, description: 'Datos inválidos proporcionados' })
  async Add(
    @Body(new ValidationPipe({ transform: true })) createDto: CreateEquiposDto,
    @Req() request: Request,
    @GetUserManager() user : User
  ) {
    const clientIp = request.socket.remoteAddress;
    const ipv4 = clientIp?.replace('::ffff:', '');
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    const { rules, ...trazaSinRules } = createDto;
    traza.traza = trazaSinRules;
    return await this.Service.Add(createDto, traza);
  }

  @UseGuards(JwtGuard)
  @Patch('actualizar')
  @ApiOperation({ summary: 'Actualizar un item existente en equipos' })
  @ApiResponse({ status: 200, description: 'Item actualizado exitosamente,returnDto.data={object updated} ' })
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async Edit(
    @Body(new ValidationPipe({ transform: true })) updateDto: UpdateEquiposDto,
    @Req() request: Request,
    @GetUserManager() user : User

  ) {
    const clientIp = request.socket.remoteAddress;
    const ipv4 = clientIp?.replace('::ffff:', '');
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    const { rules, ...trazaSinRules } = updateDto;
    traza.traza = trazaSinRules;
    return await this.Service.Edit(updateDto, traza);
  }

  @UseGuards(JwtGuard)
  @Put('cambiar-estado')
  @ApiOperation({ summary: 'Activar/Desactivar un item de equipos' })
  @ApiResponse({ status: 200, description: 'Item activado/desactivado exitosamente,returnDto.data={object active/inactive}  '})
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async State(@Body(new ValidationPipe({ transform: true })) dto: IdDto,
  @Req() request: Request,
  @GetUserManager() user : User

  ) {
    const clientIp = request.socket.remoteAddress;
    const ipv4 = clientIp?.replace('::ffff:', '');
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    traza.traza = dto;
    return await this.Service.State(dto, traza);
  }

  // @UseGuards(JwtGuard)
  // @Delete('eliminar')
  // @ApiOperation({ summary: 'Eliminar un item de equipos' })
  // @ApiResponse({ status: 200, description: 'Item eliminado exitosamente,returnDto.data={object deleted}' })
  // @ApiResponse({ status: 400, description: 'Item no encontrado' })
  // async Delete(@Body(new ValidationPipe({ transform: true })) dto: IdDto,
  // @Req() request: Request
  // ) {
  //   const clientIp = request.socket.remoteAddress;
  //   const ipv4 = clientIp?.replace('::ffff:', '');
  //   const executedUrl = request.originalUrl;
  //   const traza = new CreateTrazaDto();
  //   traza.ip = ipv4;
  //   traza.url = executedUrl;
  //   traza.traza = dto;
  //   return await this.Service.Delete(dto, traza);
  // }
}