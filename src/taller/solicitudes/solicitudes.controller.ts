import { Controller, Patch, Post } from '@nestjs/common';
import { BaseControllerCRUD } from 'src/common/base/class/base.controller.crud.class';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiBody } from '@nestjs/swagger';
import { CreateSolicitudesDto, UpdateSolicitudesDto } from './dto';
import { SolicitudesService } from './solicitudes.service';
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
import { EvalSolicitudDto } from './dto/eval-solicitud.dto';
import { SolEstadoEnum } from './enum/estado.enum';
import { EvalEnum } from './enum/eval.enum';
import { TipoEnum } from './enum/tipo.enum';
import { CloseSolicitudDto } from './dto/close-solicitud.dto';
import { GetUser } from 'src/security/auth/decorator/get-user.decorator';
import { User } from 'src/security/user/entities/user.entity';

@ApiTags('solicitudes')
@Controller('taller/solicitudes')
export class SolicitudesController extends BaseControllerCRUD<
CreateSolicitudesDto,
UpdateSolicitudesDto,
SolicitudesService
> {
  constructor(private readonly Service: SolicitudesService) {
    super(Service);
  }

     @Get('todos')
    override async findItems() {
      return super.findItems();
    }
  
  // @UseGuards(RouteAccessGuard)
  @Get(['ver-todos-activos-secure', 'ver-todos-activos-public'])
    override async findActiveItems(
    // @GetUserAdmin() user: User
    ) {
      return super.findActiveItems();
    }

  // @UseGuards(RouteAccessGuard)
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
  override async findOne(@Body(new ValidationPipe({ transform: true })) dto: IdDto, securityParam?: any): Promise<ReturnDto> {
    return this.Service.findOne(dto);
  }
  
  
  // @UseGuards(RouteAccessGuard)
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
  @ApiOperation({ summary: 'Crear un nuevo item en solicitudes' })
  @ApiResponse({ status: 200, description: 'Item creado exitosamente,returnDto.data={object saved}' })
  @ApiResponse({ status: 400, description: 'Datos inválidos proporcionados' })
  async Add(
    @Body(new ValidationPipe({ transform: true })) createDto: CreateSolicitudesDto,
    @Req() request: Request,
    @GetUser() user: User
  ) {
    createDto.id = user.id
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

  // @UseGuards(JwtGuard)
  @Patch('actualizar')
  @ApiOperation({ summary: 'Actualizar un item existente en solicitudes' })
  @ApiResponse({ status: 200, description: 'Item actualizado exitosamente,returnDto.data={object updated} ' })
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async Edit(
    @Body(new ValidationPipe({ transform: true })) updateDto: UpdateSolicitudesDto,
    @Req() request: Request
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

  // @UseGuards(JwtGuard)
  @Put('cambiar-estado')
  @ApiOperation({ summary: 'Activar/Desactivar un item de solicitudes' })
  @ApiResponse({ status: 200, description: 'Item activado/desactivado exitosamente,returnDto.data={object active/inactive}  '})
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async State(@Body(new ValidationPipe({ transform: true })) dto: IdDto,
  @Req() request: Request
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
  @Put('valorar')
  @ApiOperation({ summary: 'Valorar una solicitud por el cliente' })
  @ApiResponse({ status: 200, description: 'Item activado/desactivado exitosamente,returnDto.data={object}  '})
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async Evaluate(@Body(new ValidationPipe({ transform: true })) dto: EvalSolicitudDto,
  @Req() request: Request
  ) {
    const clientIp = request.socket.remoteAddress;
    const ipv4 = clientIp?.replace('::ffff:', '');
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    traza.traza = dto;
    return await this.Service.Evaluate(dto, traza);
  }
  // @UseGuards(JwtGuard)
  @Get('obtener-solicitudes')
  @ApiOperation({ summary: 'Obtener las solicitudes de un usuario' })
  @ApiResponse({ status: 200, description: 'Solicitudes obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Usuario no encontrado' })
  async GetRequests(@Body(new ValidationPipe({ transform: true })) dto: IdDto,
  @Req() request: Request
  ) {
    return await this.Service.GetRequests(dto);
  }
    // @UseGuards(JwtGuard)
    @Put('cancelar-solicitud')
    @ApiOperation({ summary: 'Cancelar una solicitud' })
    @ApiResponse({ status: 200, description: 'Solicitud cancelada exitosamente,returnDto.data={object}  '})
    @ApiResponse({ status: 400, description: 'Solicitud no encontrada' })
    async CancelRequest(@Body(new ValidationPipe({ transform: true })) dto: IdDto,
    @Req() request: Request
    ) {
      const clientIp = request.socket.remoteAddress;
      const ipv4 = clientIp?.replace('::ffff:', '');
      const executedUrl = request.originalUrl;
      const traza = new CreateTrazaDto();
      traza.ip = ipv4;
      traza.url = executedUrl;
      traza.traza = dto;
      return await this.Service.CancelRequest(dto, traza);
    }
  @UseGuards(JwtGuard)
  @Put('rechazar-solicitud')
  @ApiOperation({ summary: 'Rechazar una solicitud' })
  @ApiResponse({ status: 200, description: 'Solicitud rechazada exitosamente,returnDto.data={object}  '})
  @ApiResponse({ status: 400, description: 'Solicitud no encontrada' })
  async RejectRequest(@Body(new ValidationPipe({ transform: true })) dto: IdDto,
  @Req() request: Request,
  @GetUser() user: User
  ) {
    const clientIp = request.socket.remoteAddress;
    const ipv4 = clientIp?.replace('::ffff:', '');
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    traza.traza = dto;
    const idUser = user.id;
    return await this.Service.RejectRequest(dto, traza, idUser);
  }
  // @UseGuards(JwtGuard)
  @Get('obtener-solicitudes-no-asignadas')
  @ApiOperation({ summary: 'Obtener las solicitudes no asignadas' })
  @ApiResponse({ status: 200, description: 'Solicitudes no asignadas obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Solicitudes no asignadas no encontradas' })
  async GetNoAssignedRequests(@Req() request: Request) {
    return await this.Service.GetNoAssignedRequests();
  }
  // @UseGuards(JwtGuard)
  @Get('obtener-solicitudes-asignadas')
  @ApiOperation({ summary: 'Obtener las solicitudes asignadas' })
  @ApiResponse({ status: 200, description: 'Solicitudes asignadas obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Solicitudes asignadas no encontradas' })
  async GetAssignedRequests(@Req() request: Request) {
    return await this.Service.GetAssignedRequests();
  }
  // @UseGuards(JwtGuard)
  @Get('obtener-solicitudes-en-ejecucion')
  @ApiOperation({ summary: 'Obtener las solicitudes en ejecución' })
  @ApiResponse({ status: 200, description: 'Solicitudes en ejecución obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Solicitudes en ejecución no encontradas' })
  async GetInExecutionRequests(@Req() request: Request) {
    return await this.Service.GetInExecutionRequests();
  }
  // @UseGuards(JwtGuard)
  @Get('obtener-solicitudes-evaluadas')
  @ApiOperation({ summary: 'Obtener las solicitudes evaluadas' })
  @ApiResponse({ status: 200, description: 'Solicitudes evaluadas obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Solicitudes evaluadas no encontradas' })
  async GetEvaluatedRequests(@Req() request: Request) {
    return await this.Service.GetEvaluatedRequests();
  }
  // @UseGuards(JwtGuard)
  @Get('obtener-solicitudes-rechazadas')
  @ApiOperation({ summary: 'Obtener las solicitudes rechazadas' })
  @ApiResponse({ status: 200, description: 'Solicitudes rechazadas obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Solicitudes rechazadas no encontradas' })
  async GetRejectedRequests(@Req() request: Request) {
    return await this.Service.GetRejectedRequests();
  }
  // @UseGuards(JwtGuard)
  @Get('obtener-solicitudes-no-posibles')
  @ApiOperation({ summary: 'Obtener las solicitudes no posibles' })
  @ApiResponse({ status: 200, description: 'Solicitudes no posibles obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Solicitudes no posibles no encontradas' })
  async GetNoPossibleRequests(@Req() request: Request) {
    return await this.Service.GetNoPossibleRequests();
  }
  // @UseGuards(JwtGuard)
  @Get('obtener-solicitudes-realizadas')
  @ApiOperation({ summary: 'Obtener las solicitudes realizadas' })
  @ApiResponse({ status: 200, description: 'Solicitudes realizadas obtenidas exitosamente,returnDto.data={array of objects}  '})
  @ApiResponse({ status: 400, description: 'Solicitudes realizadas no encontradas' })
  async GetRealizedRequests(@Req() request: Request) {
    return await this.Service.GetRealizedRequests();
  }

  @Get('estados')
  @ApiOperation({ summary: 'Obtener el enum de estados de solicitudes para select' })
  @ApiResponse({ status: 200, description: 'Lista key/value para usar en select' })
  getEstados(): { key: string; value: string }[] {
    return (Object.entries(SolEstadoEnum) as [string, string][]).map(([k, v]) => ({
      key: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: v,
    }));
  }

  @Get('evaluaciones')
  @ApiOperation({ summary: 'Obtener el enum de evaluaciones para select' })
  @ApiResponse({ status: 200, description: 'Lista key/value para usar en select' })
  getEvaluaciones(): { key: string; value: string }[] {
    return (Object.entries(EvalEnum) as [string, string][]).map(([k, v]) => ({
      key: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: v,
    }));
  }

  @Get('tipo-solicitud')
  @ApiOperation({ summary: 'Obtener el enum de evaluaciones para select' })
  @ApiResponse({ status: 200, description: 'Lista key/value para usar en select' })
  getTipoSolicitud(): { key: string; value: string }[] {
    return (Object.entries(TipoEnum) as [string, string][]).map(([k, v]) => ({
      key: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: v,
    }));
  }

    // @UseGuards(JwtGuard)
  @Put('cerrar-solicitud')
  @ApiOperation({ summary: 'Cerrar una orden' })
  @ApiResponse({ status: 200, description: 'Orden cerrada exitosamente, returnDto.data={object closed}' })
  @ApiResponse({ status: 400, description: 'Orden no encontrada o no se pudo cerrar' })
  async CloseRequest(
    @Body(new ValidationPipe({ transform: true })) dto: CloseSolicitudDto,
    @Req() request: Request,
  ) {
    const clientIp = request.socket.remoteAddress;
    const ipv4 = clientIp?.replace('::ffff:', '');
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    traza.traza = dto;
    return await this.Service.CloseRequest(dto, traza);
  }
}