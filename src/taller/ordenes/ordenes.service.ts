import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseServiceCRUD } from 'src/common/base/class/base.service.crud.class';
import { Ordenes } from './entities/ordenes.entity';
import { CreateOrdenesDto, UpdateOrdenesDto } from './dto';
import { IdDto } from 'src/common/base/dto/id.dto';
import { Traza } from 'src/security/trazas/entities/traza.entity';
import { CreateTrazaDto } from 'src/security/trazas/dto/create-traza.dto';
import { Solicitudes } from '../solicitudes/entities/solicitudes.entity';
import { EstadoEnum } from './enum/estado.enum';
import { UpdateStateOrdenesDto } from './dto/updatestate-ordenes.dto';
import { ReturnDto } from 'src/common/base/dto';
import { CloseOrdenDto } from './dto/close-orden.dto';
import { CodeEnum } from 'src/common/enum/code.enum';
import { CreateNotificationDto } from 'src/notify/notifications/dto/create-notification.dto';
import { notifyEnum } from 'src/common/enum/notify.enum';
import { User } from 'src/security/user/entities/user.entity';
import { Notification } from 'src/notify/notifications/entities/notification.entity';


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
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
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
    return super.findOne(id);
  }

  async Add(createDto: CreateOrdenesDto, traza: CreateTrazaDto) {
    const solicitud = await this.solicitudesRepository.findOne({
      where:
      {
        id: createDto.solicitud
      }
    })

    if(solicitud.estado != EstadoEnum.SOLICITADA)
      {
        const returnDto = new ReturnDto
        returnDto.isSuccess = false
        returnDto.errorCode = CodeEnum.BAD_REQUEST
        returnDto.errorMessage = "La solicitud no esta en un estado permitido para ser asignada"
        return returnDto
      }
    const result = await super.create(createDto);
    if (result.isSuccess) {
      this.trazaRepository.save(traza);
    }


    solicitud.estado = EstadoEnum.ASIGNADA;
    await this.solicitudesRepository.save(solicitud);
    return result;
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
    // Obtener la orden
    const order = await this.repository.findOne({
      where: { id: dto.id },
      relations: ['solicitud']
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
      ( dto.newOrderState === EstadoEnum.EN_EJECUCION) &&
      ( dto.newRequestState === EstadoEnum.EN_EJECUCION)
    )
    {
      exchange = true
    }
    // 2 si estado de orden es en ejecucion solo puede pasar a Realizada  o 2 no posible
    if(order.estado == EstadoEnum.EN_EJECUCION ){
      if( dto.newOrderState === EstadoEnum.REALIZADA && dto.newRequestState === EstadoEnum.REALIZADA)
        {
          exchange = true
        }  
      else if (dto.newOrderState === EstadoEnum.NO_POSIBLE && 
        (dto.newRequestState === EstadoEnum.RECHAZADA || dto.newRequestState === EstadoEnum.NO_POSIBLE))
        {
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
    await this.solicitudesRepository.save(solicitud);
    

    // Guardar traza
    await this.trazaRepository.save(traza);
    // enviar notificaciones a usuario y a Jefe de Taller

    const notificationDto = new CreateNotificationDto();
    notificationDto.userOrigin = order.tecnico.name;
    notificationDto.destinyType = notifyEnum.USERS;
    // completar aqui

    const jefesTaller = await this.userRepository.find({
      where:
      {
        rol:
        {id:"019bd3ad-aecd-4607-b469-8f8ea90dcb3f"}
      }
    });



    notificationDto.destinyUser = jefesTaller.map(user => ({
      id: user.id,
      isReaded: false
    }));
    notificationDto.destinyUser.push(
      {
        id: order.tecnico.id,
        isReaded: false
      }
    )
    notificationDto.destinyUser.push(
      {
        id: order.solicitud.solicitante.id,
        isReaded: false
      }
    )
    // arreglar
    notificationDto.message = `La Orden de la solicitud ${solicitud.codigo} ha pasado a estado ${dto.newOrderState} y la solicitud a estado  ${dto.newRequestState}`;

    const notification = new Notification()
    notification.destinyType = notificationDto.destinyType
    notification.destinyUser = notificationDto.destinyUser
    notification.userOrigin = notificationDto.userOrigin
    notification.message = notificationDto.message
    await this.notificationRepository.save(notification)


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
}