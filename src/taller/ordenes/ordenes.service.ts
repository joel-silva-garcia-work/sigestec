import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseServiceCRUD } from '../../common/base/class/base.service.crud.class';
import { Ordenes } from './entities/ordenes.entity';
import { CreateOrdenesDto, UpdateOrdenesDto } from './dto';
import { IdDto } from '../../common/base/dto/id.dto';
import { Traza } from '../../security/trazas/entities/traza.entity';
import { CreateTrazaDto } from '../../security/trazas/dto/create-traza.dto';
import { Solicitudes } from '../solicitudes/entities/solicitudes.entity';
import { EstadoEnum } from './enum/estado.enum';
import { SolEstadoEnum } from './../solicitudes/enum/estado.enum';
import { UpdateStateOrdenesDto } from './dto/updatestate-ordenes.dto';
import { ReturnDto } from '../../common/base/dto';
import { CodeEnum } from '../../common/enum/code.enum';
import { notifyEnum } from '../../common/enum/notify.enum';
import { User } from '../../security/user/entities/user.entity';
import { CloseOrdenDto } from './dto/close-orden.dto';
import { CreateNotificationDto } from 'src/notify/notifications/dto/create-notification.dto';
import { NotificationsService } from 'src/notify/notifications/notifications.service';


@Injectable()
export class OrdenesService extends BaseServiceCRUD<
Ordenes,
CreateOrdenesDto,
UpdateOrdenesDto> {
  constructor(
    @InjectRepository(Ordenes)
    private readonly repository: Repository<Ordenes>,
    @InjectRepository(Traza)
    private readonly trazaRepository: Repository<Traza>,
    @InjectRepository(Solicitudes)
    private readonly solicitudesRepository: Repository<Solicitudes>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationsService

  ) {
    super(repository)
  }

  /** Construye un `CreateNotificationDto` para notificaciones de orden (destino usuario concreto). */
  private buildOrderNotificationDto(params: {
    userOrigin: string;
    destinyID: string;
    message: string;
    destinyType?: notifyEnum;
    isOrder?: boolean;
  }): CreateNotificationDto {
    const dto = new CreateNotificationDto();
    dto.userOrigin = params.userOrigin;
    dto.destinyID = params.destinyID;
    dto.destinyType = params.destinyType ?? notifyEnum.USERS;
    dto.isOrder = params.isOrder ?? true;
    // dto.isRead = false;
    dto.message = params.message;
    return dto;
  }

  /** Construye y persiste una notificación a partir del DTO (delega en NotificationsService). */
  private async sendAndSaveNotification(dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  override async findAllItems() {
    return super.findAllItems();
  }


  override async findActiveItems() {
    return super.findActiveItems();
  }

  override async findOne(id: IdDto) {
    return super.findOne(id);
  }

  async Add(createDto: CreateOrdenesDto, traza: CreateTrazaDto) {
    const solicitud = await this.solicitudesRepository.findOne({
      where: { id: createDto.solicitud },
    })
    if(solicitud.estado != SolEstadoEnum.SOLICITADA)
      {
        const returnDto = new ReturnDto
        returnDto.isSuccess = false
        returnDto.errorCode = CodeEnum.BAD_REQUEST
        returnDto.errorMessage = "La solicitud no esta en un estado permitido para ser asignada"
        return returnDto
      }
    const result = await super.create(createDto);
    if (result.isSuccess) 
      {
      this.trazaRepository.save(traza);

    solicitud.estado = SolEstadoEnum.ASIGNADA;
    await this.solicitudesRepository.save(solicitud);
      const order = await this.repository.findOne({
        where: { solicitud: { id: createDto.solicitud} }
      });
      const msgAsignada = `La orden ${order.solicitud.codigo} ha sido asignada a ${order.tecnico.name}. Se ha creado una orden.`;
      await this.sendAndSaveNotification(
        this.buildOrderNotificationDto({
          userOrigin: createDto.userID,
          destinyID: order.tecnico.id,
          message: msgAsignada,
        }),
      );
      await this.sendAndSaveNotification(
        this.buildOrderNotificationDto({
          userOrigin: createDto.userID,
          destinyID: solicitud.solicitante.id,
          message: msgAsignada,
        }),
      );
  
    }

    return result

}

  
  async Edit(updateDto: UpdateOrdenesDto, traza: CreateTrazaDto) {
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

  async ChangeOrderAndRequestState(
    dto: UpdateStateOrdenesDto,
    traza: CreateTrazaDto
  ) {
    // Obtener la orden (tecnico es eager; solicitud también)
    const order = await this.repository.findOne({
      where: { id: dto.id },
      // relations: ['solicitud', 'solicitud.solicitante'],
    });

    if (!order) {
      return {
        isSuccess: false,
        message: 'Orden no encontrada'
      };
    }
    let exchange = false 

    // Reglas para cambio de estados
    // 1 si orden asignada prox estado puede ser 1 en ejecucion  
    if(order.estado == EstadoEnum.ASIGNADA && 
      ( dto.newOrderState === EstadoEnum.EN_EJECUCION) 
    )
    {
      dto.newRequestState = SolEstadoEnum.EN_EJECUCION
      exchange = true
    }
    // 2 si estado de orden es en ejecucion solo puede pasar a Realizada  o 2 no posible
    if(order.estado == EstadoEnum.EN_EJECUCION ){
      if( dto.newOrderState === EstadoEnum.REALIZADA )
        {
          dto.newRequestState = SolEstadoEnum.REALIZADA
          exchange = true
        }  
      else if (dto.newOrderState === EstadoEnum.NO_POSIBLE) 
        {
          dto.newRequestState = SolEstadoEnum.NO_POSIBLE
          exchange = true
        }    
    } 
     
    if(exchange == false)
    {
      const returnDto = new ReturnDto
      returnDto.isSuccess = false
      returnDto.errorMessage = "El estado de la orden no es posible cambiar"
      returnDto.errorCode = CodeEnum.BAD_REQUEST
      return returnDto
    }
    // Cambiar estado de la orden
    order.estado = dto.newOrderState;
    await this.repository.save(order);
    
    // Cambiar estado de la solicitud asociada
    const solicitud = order.solicitud as Solicitudes;
    solicitud.estado = dto.newRequestState;
    await this.solicitudesRepository.save(solicitud);
    

    // Guardar traza
    // await this.trazaRepository.save(traza);
    // Enviar notificaciones a jefes de taller, técnico (UUID) y solicitante

    const jefe = await this.userRepository.findOne({
      where: { rol: { id: '019bd3ad-aecd-4607-b469-8f8ea90dcb3f' } },
    });

    const msgCambioEstado = `La orden ${order.solicitud.codigo} ha sido cambiado a estado ${dto.newOrderState} y la solicitud a estado ${dto.newRequestState}`;
    if (jefe) {
      await this.sendAndSaveNotification(
        this.buildOrderNotificationDto({
          userOrigin: dto.userID,
          destinyID: jefe.id,
          message: msgCambioEstado,
        }),
      );
    }
    if (solicitud.solicitante) {
      await this.sendAndSaveNotification(
        this.buildOrderNotificationDto({
          userOrigin: dto.userID,
          destinyID: solicitud.solicitante.id,
          message: msgCambioEstado,
        }),
      );
    }
    return {
      isSuccess: true,
      message: 'Estados actualizados correctamente',
      data: order
    };
  }

    async CloseOrder(
    dto: CloseOrdenDto,
    traza: CreateTrazaDto
  ) {
    // Obtener la orden (tecnico es eager; solicitud también)
    const order = await this.repository.findOne({
      where: { id: dto.id },
    });

    if (!order) {
      return {
        isSuccess: false,
        message: 'Orden no encontrada'
      };
    }
    let exchange = false 

    // 2 si estado de orden es en ejecucion solo puede pasar a Realizada  o 2 no posible
    if(order.estado == EstadoEnum.EN_EJECUCION ){
      if( dto.newOrderState === EstadoEnum.REALIZADA )
        {
          dto.newRequestState = SolEstadoEnum.REALIZADA
          order.notaTec = dto.notaGen
          exchange = true
        }  
      else if (dto.newOrderState === EstadoEnum.NO_POSIBLE) 
        {
          dto.newRequestState = SolEstadoEnum.NO_POSIBLE
          order.notaTec = dto.notaGen
          exchange = true
        }    
    } 
     
    if(exchange == false)
    {
      const returnDto = new ReturnDto
      returnDto.isSuccess = false
      returnDto.errorMessage = "El estado de la orden no es posible cambiar"
      returnDto.errorCode = CodeEnum.BAD_REQUEST
      return returnDto
    }
    // Cambiar estado de la orden
    order.estado = dto.newOrderState;
    await this.repository.save(order);
    
    // Cambiar estado de la solicitud asociada
    const solicitud = order.solicitud
    solicitud.estado = dto.newRequestState;
    if(dto.newRequestState === SolEstadoEnum.NO_POSIBLE)
    {
      solicitud.nota = dto.notaGen
    }
    else
    {
      solicitud.nota = null
    }
    await this.solicitudesRepository.save(solicitud);
    

    // Guardar traza
    // await this.trazaRepository.save(traza);

    const jefesTaller = await this.userRepository.find({
      where: { rol: { id: '019bd3ad-aecd-4607-b469-8f8ea90dcb3f' } },
    });

    const msgCierre = `La orden de la solicitud ${solicitud.codigo} ha pasado a estado ${dto.newOrderState} y la solicitud a estado ${dto.newRequestState}`;
    const userOriginClose =
      order.tecnico?.id ?? solicitud.solicitante?.id ?? jefesTaller[0]?.id ?? '';

    if (userOriginClose) {
      for (const jefe of jefesTaller) {
        await this.sendAndSaveNotification(
          this.buildOrderNotificationDto({
            userOrigin: userOriginClose,
            destinyID: jefe.id,
            message: msgCierre,
          }),
        );
      }
      if (solicitud.solicitante?.id) {
        await this.sendAndSaveNotification(
          this.buildOrderNotificationDto({
            userOrigin: userOriginClose,
            destinyID: solicitud.solicitante.id,
            message: msgCierre,
          }),
        );
      }
    }

    return {
      isSuccess: true,
      message: 'Estados actualizados correctamente',
      data: order
    };
  }
  

  async GetOrdersByTechnician(dto: IdDto) {
    const orders = await this.repository.find({
      where: {
        tecnico: {id: dto.id}
      }
    });
    const returnDto = new ReturnDto();
    returnDto.data = orders;
    returnDto.isSuccess = true;
    return returnDto;
  }

  async GetAssignedOrders() {
    const returnDto = new ReturnDto();
    const orders = await this.repository.find({
      where: {
        estado: EstadoEnum.ASIGNADA
      }
    });
    returnDto.data = orders;
    returnDto.isSuccess = true;
    return returnDto;
  }

  async GetInExecutionOrders() {
    const returnDto = new ReturnDto();
    const orders = await this.repository.find({
      where: {
        estado: EstadoEnum.EN_EJECUCION
      }
    });
    returnDto.data = orders;
    returnDto.isSuccess = true;
    return returnDto;
  }

  async GetSolvedOrders() {
    const returnDto = new ReturnDto();
    const orders = await this.repository.find({
      where: {
        estado: EstadoEnum.REALIZADA
      }
    });
    returnDto.data = orders;
    returnDto.isSuccess = true;
    return returnDto;
  }
  async GetUnsolvedOrders() {
    const returnDto = new ReturnDto();
    const orders = await this.repository.find({
      where: {
        estado: EstadoEnum.NO_POSIBLE
      }
    });
    returnDto.data = orders;
    returnDto.isSuccess = true;
    return returnDto;
  }
  async GetAllTechnician() {
    const returnDto = new ReturnDto();
    const users = await this.userRepository.find({
      where: {
        rol: { id: '86e1985c-576c-4129-b81c-c88270fe9c42' }
      }
    });
    returnDto.data = users;
    returnDto.isSuccess = true;
    return returnDto;
  }
}