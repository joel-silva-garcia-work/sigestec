import { Injectable } from '@nestjs/common';
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
import { EstadoEnum } from './enum/estado.enum';
import { ReturnDto } from './../../common/base/dto';
import { CodeEnum } from './../../common/enum/code.enum';
import { Ordenes } from '../ordenes/entities/ordenes.entity';


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
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Ordenes)
    private readonly ordenesRepository: Repository<Ordenes>,
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
    createDto.codigo = await this.createCode()
    const result = await super.create(createDto);
    if (result.isSuccess) {
      this.trazaRepository.save(traza);
    }
    
    const notificationDto = new CreateNotificationDto();
    notificationDto.userOrigin = createDto.solicitante;
    notificationDto.destinyType = notifyEnum.USERS;
    
    const users = await this.userRepository.find({
      where: {
        rol: {id: "019bd3ad-aecd-4607-b469-8f8ea90dcb3f"}
      }
    });

    notificationDto.destinyUser = users.map(user => ({
      id: user.id,
      isSolititudRead: false,
      isOrderRead: false,
      servicioID: (result.data as Solicitudes).id,

    }));
    // revisar que esta salvando
    const user = await this.userRepository.findOne({
      where: {
        id: createDto.solicitante
      }
    });
    notificationDto.message = `Solicitud ${(result.data as Solicitudes).codigo} ha sido creada por ${user.name}`;

    const notification = new Notification()
    notification.destinyType = notificationDto.destinyType
    notification.destinyUser = notificationDto.destinyUser
    notification.userOrigin = notificationDto.userOrigin
    notification.message = notificationDto.message
    await this.notificationRepository.save(notification)

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
    if(solicitud.estado != EstadoEnum.REALIZADA)
    {
      const returnDto = new ReturnDto
      returnDto.errorCode = CodeEnum.BAD_REQUEST
      returnDto.isSuccess = false
      returnDto.errorMessage = "El estado de la orden no es Realizada"
      return returnDto
    }
    solicitud.evaluacion = dto.evaluacion;
    solicitud.nota = dto.nota;
    solicitud.estado = EstadoEnum.EVALUADA;
    await this.repository.save(solicitud);
    this.trazaRepository.save(traza);

    const order = await this.ordenesRepository.findOne({
      where: { solicitud: { id: solicitud.id } },
      relations: ['tecnico'],
    });
    if (order?.tecnico?.id) {
      const notification = new Notification();
      notification.userOrigin = solicitud.solicitante?.id ?? ''; // UUID del solicitante que evaluó
      notification.destinyType = notifyEnum.USERS;
      notification.destinyUser = [
        { id: order.tecnico.id, isSolititudRead: false, isOrderRead: false, servicioID: solicitud.id, orderID: order.id },
      ];
      notification.message = `La solicitud ${solicitud.codigo} ha sido evaluada por el cliente.`;
      await this.notificationRepository.save(notification);
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

  async RejectRequest(dto: IdDto, traza: CreateTrazaDto) {
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
    if(solicitud.estado != EstadoEnum.SOLICITADA)
    {
      const returnDto = new ReturnDto
      returnDto.isSuccess = false
      returnDto.errorMessage ="La solicitud no esta en estado solicitada"
      returnDto.errorCode = CodeEnum.BAD_REQUEST
      return returnDto
    }
    solicitud.estado = EstadoEnum.RECHAZADA;
    await this.repository.save(solicitud);
    this.trazaRepository.save(traza);

    if (solicitud.solicitante?.id) {
      const notification = new Notification();
      notification.userOrigin = 'Sistema';
      notification.destinyType = notifyEnum.TEXT;
      notification.destinyUser = [
        { id: solicitud.solicitante.id, isSolititudRead: false, isOrderRead: false, servicioID: solicitud.id },
      ];
      notification.message = `Su solicitud ${solicitud.codigo} ha sido rechazada.`;
      await this.notificationRepository.save(notification);
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
    if(solicitud.estado != EstadoEnum.SOLICITADA)
    {
      const returnDto = new ReturnDto
      returnDto.isSuccess = false
      returnDto.errorMessage ="La solicitud no esta en estado solicitada"
      returnDto.errorCode = CodeEnum.BAD_REQUEST
      return returnDto
    }
    solicitud.estado = EstadoEnum.CANCELAR;
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
        estado: EstadoEnum.SOLICITADA
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
        estado: EstadoEnum.ASIGNADA
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
        estado: EstadoEnum.EN_EJECUCION
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
        estado: EstadoEnum.EVALUADA
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
        estado: EstadoEnum.RECHAZADA
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
        estado: EstadoEnum.NO_POSIBLE
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
        estado: EstadoEnum.REALIZADA
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
      
      console.log(code)
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


}