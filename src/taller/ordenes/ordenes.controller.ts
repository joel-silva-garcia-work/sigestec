import { Controller, Patch, Post } from '@nestjs/common';
import { BaseControllerCRUD } from '../../common/base/class/base.controller.crud.class';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiBody } from '@nestjs/swagger';
import { CreateOrdenesDto, UpdateOrdenesDto } from './dto';
import { OrdenesService } from './ordenes.service';
import { IdDto } from '../../common/base/dto/id.dto';
import { CreateTrazaDto } from '../../security/trazas/dto/create-traza.dto';
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
import { JwtGuard } from '../../security/auth/guard';
import { RouteAccessGuard } from '../../common/guards/route-access.guard';
import { ReturnDto } from '../../common/base/dto';
import { UpdateStateOrdenesDto } from './dto/updatestate-ordenes.dto';
import { EstadoEnum } from './enum/estado.enum';
import { CloseOrdenDto } from './dto/close-orden.dto';
import { User } from 'src/security/user/entities/user.entity';
import { GetUser, GetUserManager, GetUserAdmin } from 'src/security/auth/decorator';

@ApiTags('ordenes')
@Controller('taller/ordenes')
export class OrdenesController extends BaseControllerCRUD<
CreateOrdenesDto,
UpdateOrdenesDto,
OrdenesService
> {
  constructor(private readonly Service: OrdenesService) {
    super(Service);
  }

  @UseGuards(JwtGuard)
  @Get('todos')
    override async findItems() {
      return super.findItems();
    }
  
  @UseGuards(RouteAccessGuard)
  @Get(['ver-todos-activos-secure', 'ver-todos-activos-public'])
    override async findActiveItems(
    @GetUser() user: User
    ) {
      return super.findActiveItems();
    }

  @UseGuards(RouteAccessGuard)
  @Get(['ver-uno-secure', 'ver-uno-public'])  
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
  override async findOne(@Body(new ValidationPipe({ transform: true })) dto: IdDto, 
  @GetUser() user: User): Promise<ReturnDto> {
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
  override async findOneActive(@Body(new ValidationPipe({ transform: true })) dto: IdDto, 
  @GetUser() user: User): Promise<ReturnDto> {
    return this.Service.findOneActive(dto);
  }

  @UseGuards(JwtGuard)
  @Post('adicionar')
  @ApiOperation({ summary: 'Crear un nuevo item en ordenes' })
  @ApiResponse({ status: 200, description: 'Item creado exitosamente,returnDto.data={object saved}' })
  @ApiResponse({ status: 400, description: 'Datos inválidos proporcionados' })
  async Add(
    @Body(new ValidationPipe({ transform: true })) createDto: CreateOrdenesDto,
    @Req() request: Request,
    @GetUserManager() user: User
  ) {
    createDto.userID = user.id;
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
  @ApiOperation({ summary: 'Actualizar un item existente en ordenes' })
  @ApiResponse({ status: 200, description: 'Item actualizado exitosamente,returnDto.data={object updated} ' })
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async Edit(
    @Body(new ValidationPipe({ transform: true })) updateDto: UpdateOrdenesDto,
    @Req() request: Request,
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
  @ApiOperation({ summary: 'Activar/Desactivar un item de ordenes' })
  @ApiResponse({ status: 200, description: 'Item activado/desactivado exitosamente,returnDto.data={object active/inactive}  '})
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async State(@Body(new ValidationPipe({ transform: true })) dto: IdDto,
  @Req() request: Request,
  @GetUserManager() user: User
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
  @Put('cerrar-orden')
  @ApiOperation({ summary: 'Cerrar una orden' })
  @ApiResponse({ status: 200, description: 'Orden cerrada exitosamente, returnDto.data={object closed}' })
  @ApiResponse({ status: 400, description: 'Orden no encontrada o no se pudo cerrar' })
  async CloseOrder(
    @Body(new ValidationPipe({ transform: true })) dto: CloseOrdenDto,
    @Req() request: Request,
  ) {
    const clientIp = request.socket.remoteAddress;
    const ipv4 = clientIp?.replace('::ffff:', '');
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    traza.traza = dto;
    return await this.Service.CloseOrder(dto, traza);
  }


  @UseGuards(JwtGuard)
  @Patch('cambiar-estado-ordenes-y-solicitudes')
  @ApiOperation({ summary: 'Actualizar un item existente en ordenes' })
  @ApiResponse({ status: 200, description: 'Item actualizado exitosamente,returnDto.data={object updated} ' })
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async UpdateStateOrderAndRequest(
    @Body(new ValidationPipe({ transform: true })) updateDto: UpdateStateOrdenesDto,
    @Req() request: Request,
    @GetUserManager() user: User
  ) {
    updateDto.userID = user.id;
    const clientIp = request.socket.remoteAddress;
    const ipv4 = clientIp?.replace('::ffff:', '');
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    traza.traza = traza;
    return await this.Service.ChangeOrderAndRequestState(updateDto, traza);
  }

  // @UseGuards(JwtGuard)
  @Get('obtener-ordenes-tecnico')
  @ApiOperation({ summary: 'Obtener las solicitudes de un usuario' })
  @ApiResponse({ status: 200, description: 'Solicitudes obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Usuario no encontrado' })
  async GetRequests(@Body(new ValidationPipe({ transform: true })) dto: IdDto,
  @Req() request: Request
  ) {
    return await this.Service.GetOrdersByTechnician(dto);
  }

  // @UseGuards(JwtGuard)
  @Get('obtener-ordenes-asignadas')
  @ApiOperation({ summary: 'Obtener las ordenes asignadas' })
  @ApiResponse({ status: 200, description: 'Ordenes asignadas obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Ordenes asignadas no encontradas' })
  async GetAssignedOrders(@Req() request: Request) {
    return await this.Service.GetAssignedOrders();
  }
  // @UseGuards(JwtGuard)
  @Get('obtener-ordenes-en-ejecucion')
  @ApiOperation({ summary: 'Obtener las ordenes en ejecución' })
  @ApiResponse({ status: 200, description: 'Ordenes en ejecución obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Ordenes en ejecución no encontradas' })
  async GetInExecutionOrders(@Req() request: Request) {
    return await this.Service.GetInExecutionOrders();
  }
  // @UseGuards(JwtGuard)
  @Get('obtener-ordenes-cerradas')
  @ApiOperation({ summary: 'Obtener las ordenes cerradas' })
  @ApiResponse({ status: 200, description: 'Ordenes cerradas obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Ordenes cerradas no encontradas' })
  async GetSolvedOrders(@Req() request: Request) {
    return await this.Service.GetSolvedOrders();
  }
  // @UseGuards(JwtGuard)
  @Get('obtener-ordenes-no-solucionadas')
  @ApiOperation({ summary: 'Obtener las ordenes no solucionadas' })
  @ApiResponse({ status: 200, description: 'Ordenes no solucionadas obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Ordenes no solucionadas no encontradas' })
  async GetUnsolvedOrders(@Req() request: Request) {
    return await this.Service.GetUnsolvedOrders();
  }

  @Get('estados')
  @ApiOperation({ summary: 'Obtener el enum de estados de órdenes para select' })
  @ApiResponse({ status: 200, description: 'Lista key/value para usar en select' })
  getEstados(): { key: string; value: string }[] {
    return (Object.entries(EstadoEnum) as [string, string][]).map(([k, v]) => ({
      key: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: v,
    }));
  }

  async GetAllTechnician() {
    return await this.Service.GetAllTechnician();
  }
}
