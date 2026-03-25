import { ConflictException, Injectable } from '@nestjs/common';
import { generateString, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseServiceCRUD } from './../../common/base/class/base.service.crud.class';
import { Solicitudes } from './entities/solicitudes.entity';
import { CreateSolicitudesDto, UpdateSolicitudesDto } from './dto';
import { IdDto } from './../../common/base/dto/id.dto';
import { Traza } from './../../security/trazas/entities/traza.entity';
import { CreateTrazaDto } from './../../security/trazas/dto/create-traza.dto';
import { Notification } from './../..//notify/notifications/entities/notification.entity';
import { CreateNotificationDto } from './../../notify/notifications/dto/create-notification.dto';
import { notifyEnum } from './../../common/enum/notify.enum';
import { User } from './../../security/user/entities/user.entity';
import { EvalSolicitudDto } from './dto/eval-solicitud.dto';
import { SolEstadoEnum } from './enum/estado.enum';
import { ReturnDto } from './../../common/base/dto';
import { CodeEnum } from './../../common/enum/code.enum';
import { Ordenes } from '../ordenes/entities/ordenes.entity';
import { Configuration } from 'src/config/configuration/entities/configuration.entity';
import { CloseSolicitudDto } from './dto/close-solicitud.dto';
import { NotificationsService } from 'src/notify/notifications/notifications.service';


@Injectable()
export class SolicitudesService extends BaseServiceCRUD<
Solicitudes,
CreateSolicitudesDto,
UpdateSolicitudesDto> {
  constructor(
    @InjectRepository(Solicitudes)
    private readonly repository: Repository<Solicitudes>,
    @InjectRepository(Traza)
    private readonly trazaRepository: Repository<Traza>,
    // @InjectRepository(Notification)
    // private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Ordenes)
    private readonly ordenesRepository: Repository<Ordenes>,
    @InjectRepository(Configuration)
    private readonly configRepository: Repository<Configuration>,

    private readonly notificationService: NotificationsService
  ) {
    super(repository)
  }

  override async findAllItems() {
    return super.findAllItems();
  }


  override async findActiveItems() {
    return super.findActiveItems();
  }

  override async findOne(id: IdDto) {
    return await super.findOne(id);
  }

  async Add(createDto: CreateSolicitudesDto, traza: CreateTrazaDto) {
    createDto.codigo = await this.nextNumber()
    const result = await super.create(createDto);
    if (result.isSuccess) {
      this.trazaRepository.save(traza);
    }
    
    // ciclo para crear notificaciones individuales para todos los Jefes de Taller
    // -  Busco  los Jefes de taller por su ID
      const users = await this.userRepository.find({
        where: {
          rol: {id: "019bd3ad-aecd-4607-b469-8f8ea90dcb3f"}
        }
      });
    // - Hago ciclo paracrear cada notificacion individual por el DTO de notificaciones
    users.forEach(async(destinartary) =>{
      const notificationDto = new CreateNotificationDto();
      // Añado el solicitante y el tipo de destinatario
      notificationDto.userOrigin = createDto.solicitante;
      notificationDto.destinyType = notifyEnum.USERS;
      // Adiciono el destino
      notificationDto.destinyID = destinartary.id
      // obtengo el usuario origen para format el mensaje

      const userOrigin = await this.userRepository.findOne({
        where: {
          id: createDto.solicitante
        }
      });
      notificationDto.message = `Solicitud ${(result.data as Solicitudes).codigo} ha sido creada por ${userOrigin.name}`
      notificationDto.isRead = false
      // Determino el tipo de notificacion entre solicitud y Orden
      notificationDto.isOrder = false
      // Asigno el ID segun el tipo
      notificationDto.objectID = (result.data as Solicitudes).id
      await this.notificationService.create(notificationDto)
    })

    return result;
  }

  async Edit(updateDto: UpdateSolicitudesDto, traza: CreateTrazaDto) {
    const result = await super.update(updateDto);
    if (result.isSuccess) {
      this.trazaRepository.save(traza);
    }
    return result;
  }

  async State(dto: IdDto, traza: CreateTrazaDto) {
    const result = await super.active(dto);
    if (result.isSuccess) {
      this.trazaRepository.save(traza);
    }
    return result;
  }

  async Delete(dto: IdDto, traza: CreateTrazaDto) {
    const result = await super.remove(dto);
    if (result.isSuccess) {
      this.trazaRepository.save(traza);
    }
    return result;
  }

  async Evaluate(dto: EvalSolicitudDto,traza: CreateTrazaDto) {
    const solicitud = await this.repository.findOne({
      where: { id: dto.id },
      relations: ['solicitante'],
    });
    if (!solicitud) {
      return {
        isSuccess: false,
        data: null,
        message: 'Solicitud no encontrada'
      };
    }
    if(solicitud.estado != SolEstadoEnum.REALIZADA)
    {
      const returnDto = new ReturnDto
      returnDto.errorCode = CodeEnum.BAD_REQUEST
      returnDto.isSuccess = false
      returnDto.errorMessage = "El estado de la orden no es Realizada"
      return returnDto
    }
    solicitud.evaluacion = dto.evaluacion;
    solicitud.nota = dto.nota;
    solicitud.estado = SolEstadoEnum.EVALUADA;
    await this.repository.save(solicitud);
    this.trazaRepository.save(traza);

    const order = await this.ordenesRepository.findOne({
      where: { solicitud: { id: solicitud.id } },
      relations: ['tecnico'],
    });
    if (order?.tecnico?.id) {
    const notificationDto = new CreateNotificationDto();

    notificationDto.userOrigin = solicitud.solicitante.id;
    notificationDto.destinyType = notifyEnum.USERS;
    // Adiciono el destino
    notificationDto.destinyID = order?.tecnico?.id
    // obtengo el usuario origen para format el mensaje

    const userOrigin = await this.userRepository.findOne({
      where: {
        id: solicitud.solicitante.id
      }
    });
    notificationDto.message = `Solicitud ${solicitud.codigo} ha sido creada por ${userOrigin.name}`
    notificationDto.isRead = false
    // Determino el tipo de notificacion entre solicitud y Orden
    notificationDto.isOrder = false
    // Asigno el ID segun el tipo
    notificationDto.objectID = solicitud.id
    await this.notificationService.create(notificationDto)

    }

    return {
      isSuccess: true,
      data: solicitud,
      message: 'Solicitud evaluada exitosamente'
    };
  }
  async GetRequests(dto: IdDto) {
    const returnDto = new ReturnDto();
    const solicitudes =  await this.repository.find({
      where: {
        solicitante: {id: dto.id}
      }
    });
    returnDto.data = solicitudes;
    returnDto.isSuccess = true;
    return returnDto;
  }


  async RejectRequest(dto: IdDto, traza: CreateTrazaDto, idUser: string) {
    const solicitud = await this.repository.findOne({
      where: { id: dto.id },
      relations: ['solicitante'],
    });
    if (!solicitud) {
      return {
        isSuccess: false,
        data: null,
        errorMessage: 'Solicitud no encontrada'
      };
    }
    if(solicitud.estado != SolEstadoEnum.SOLICITADA)
    {
      const returnDto = new ReturnDto
      returnDto.isSuccess = false
      returnDto.errorMessage ="La solicitud no esta en estado solicitada"
      returnDto.errorCode = CodeEnum.BAD_REQUEST
      return returnDto
    }
    solicitud.estado = SolEstadoEnum.RECHAZADA;
    await this.repository.save(solicitud);
    this.trazaRepository.save(traza);

    if (solicitud.solicitante?.id) {
      const notificationDto = new CreateNotificationDto();
      // cambiar por usuario autenticado
      notificationDto.userOrigin = idUser;
      notificationDto.destinyType = notifyEnum.USERS;
      notificationDto.destinyID = solicitud.solicitante.id;
      notificationDto.message = `Su solicitud ${solicitud.codigo} ha sido rechazada.`;
      notificationDto.isRead = false;
      notificationDto.isOrder = false;
      notificationDto.objectID = solicitud.id;
      await this.notificationService.create(notificationDto);
    }

    return {
      isSuccess: true,
      data: solicitud,
      message: 'Solicitud rechazada exitosamente'
    };
  }

  async CancelRequest(dto: IdDto, traza: CreateTrazaDto) {
    const solicitud = await this.repository.findOne({
      where: {
        id: dto.id
      }
    });
    if (!solicitud) {
      return {
        isSuccess: false,
        data: null,
        errorMessage: 'Solicitud no encontrada'
      };
    }
    if(solicitud.estado != SolEstadoEnum.SOLICITADA)
    {
      const returnDto = new ReturnDto
      returnDto.isSuccess = false
      returnDto.errorMessage ="La solicitud no esta en estado solicitada"
      returnDto.errorCode = CodeEnum.BAD_REQUEST
      return returnDto
    }
    solicitud.estado = SolEstadoEnum.CANCELAR;
    await this.repository.save(solicitud);
    this.trazaRepository.save(traza);
    return {
      isSuccess: true,
      data: solicitud,
      message: 'Solicitud cancelada exitosamente'
    };
  }

  async GetNoAssignedRequests() {
    const returnDto = new ReturnDto();
    const solicitudes = await this.repository.find({
      where: {
        estado: SolEstadoEnum.SOLICITADA
      }
    });
    returnDto.data = solicitudes;
    returnDto.isSuccess = true;
    return returnDto;
  }

  async GetAssignedRequests() {
    const returnDto = new ReturnDto();
    const solicitudes = await this.repository.find({
      where: {
        estado: SolEstadoEnum.ASIGNADA
      }
    });
    returnDto.data = solicitudes;
    returnDto.isSuccess = true;
    return returnDto;
  }

  async GetInExecutionRequests() {
    const returnDto = new ReturnDto();
    const solicitudes = await this.repository.find({
      where: {
        estado: SolEstadoEnum.EN_EJECUCION
      }
    });
    returnDto.data = solicitudes;
    returnDto.isSuccess = true;
    return returnDto;
  }

  async GetEvaluatedRequests() {
    const returnDto = new ReturnDto();
    const solicitudes = await this.repository.find({
      where: {
        estado: SolEstadoEnum.EVALUADA
      }
    });
    returnDto.data = solicitudes;
    returnDto.isSuccess = true;
    return returnDto;
  }

  async GetRejectedRequests() {
    const returnDto = new ReturnDto();
    const solicitudes = await this.repository.find({
      where: {
        estado: SolEstadoEnum.RECHAZADA
      }
    });
    returnDto.data = solicitudes;
    returnDto.isSuccess = true;
    return returnDto;
  }

  async GetNoPossibleRequests() {
    const returnDto = new ReturnDto();
    const solicitudes = await this.repository.find({
      where: {
        estado: SolEstadoEnum.NO_POSIBLE
      }
    });
    returnDto.data = solicitudes;
    returnDto.isSuccess = true;
    return returnDto;
  }

  async GetRealizedRequests() {
    const returnDto = new ReturnDto();
    const solicitudes = await this.repository.find({
      where: {
        estado: SolEstadoEnum.REALIZADA
      }
    });
    returnDto.data = solicitudes;
    returnDto.isSuccess = true;
    return returnDto;
  }
  
  async createCode(){
    let exist = true
    let code = generateString()
    while(exist)
    {
      
      const solicitud = await this.repository.findOne({
        where:
        {
          codigo:code
        }
      })
      if(!solicitud)
      {
        exist = false
      }
     else
     {
      code = generateString()
     } 
    }
    return code
  }
  async nextTo() {
    // Obtenemos el primer registro de config, el campo comercialCode, le sumamos 1, lo guardamos y lo retornamos
    const config = await this.configRepository.findOne({
      where: {
        key: 0,
      },
    });
    if (!config) {
      throw new ConflictException('No existe configuración para prefactura');
    }
    let currentCode = Number(config.numero) || 0;
    currentCode += 1;
    config.numero = currentCode;
    await this.configRepository.save(config);
    return currentCode;
  }
  async nextNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const numero = await this.nextTo();

    const config = await this.configRepository.findOne({
      where: {
        key: 0,
      },
    });

    let nextPrefactura: number;

    // If no previous prefactura exists or it's from a different year, start from 1
    if (config.actual_year !== currentYear) {
      nextPrefactura = 1;
      // aca salvo en config
      config.actual_year = currentYear;
      config.numero = nextPrefactura;
      await this.configRepository.save(config);
    } else {
      nextPrefactura = numero;
    }

    return `${nextPrefactura}/${currentYear}`;
  }

    async CloseRequest(
    dto: CloseSolicitudDto,
    traza: CreateTrazaDto
  ) {
    // Obtener la orden (tecnico es eager; solicitud también)
    const request = await this.repository.findOne({
      where: { id: dto.id }
    });

    if (!request) {
      return {
        isSuccess: false,
        message: 'Solicitud no encontrada'
      };
    }
    let exchange = false 

    // 2 si estado de orden es en ejecucion solo puede pasar a Realizada  o 2 no posible
    if(request.estado == SolEstadoEnum.SOLICITADA ){
      request.nota = dto.nota
      request.estado = SolEstadoEnum.RECHAZADA
      exchange = true
    } 
     
    if(exchange == false)
    {
      const returnDto = new ReturnDto
      returnDto.isSuccess = false
      returnDto.errorMessage = "El estado de la solicitud no es posible cambiar"
      returnDto.errorCode = CodeEnum.BAD_REQUEST
      return returnDto
    }
    // Cambiar estado 
    
    await this.repository.save(request);
    

    // Guardar traza
    // await this.trazaRepository.save(traza);
    // Enviar notificaciones a jefes de taller, técnico (UUID) y solicitante

    const jefesTaller = await this.userRepository.find({
      where: { rol: { id: '019bd3ad-aecd-4607-b469-8f8ea90dcb3f' } },
    });

    const destinyUser = jefesTaller.map((user) => ({
      id: user.id,
      isSolititudRead: false,
      isOrderRead: false,
      servicioID: request.id,
      orderID: null,
    }));

    if (request.solicitante?.id) {
      destinyUser.push({
        id: request.solicitante.id,
        isSolititudRead: false,
        isOrderRead: false,
        servicioID: request.id,
        orderID: null,
      });
    }

      const notificationDto = new CreateNotificationDto();
      // Añado el solicitante y el tipo de destinatario
      notificationDto.userOrigin = request.solicitante?.id;
      notificationDto.destinyType = notifyEnum.USERS;
      // Adiciono el destino
      notificationDto.destinyID = request.solicitante?.id
      // obtengo el usuario origen para format el mensaje

      notificationDto.isRead = false
      // Determino el tipo de notificacion entre solicitud y Orden
      notificationDto.isOrder = false
      // Asigno el ID segun el tipo
      notificationDto.objectID =  request.id
  
    notificationDto.message = `La solicitud ${request.codigo} ha pasado a estado ${SolEstadoEnum.RECHAZADA}`;
    await this.notificationService.create(notificationDto)


    return {
      isSuccess: true,
      message: 'Estados actualizados correctamente',
      data: request
    };
  }
  

}