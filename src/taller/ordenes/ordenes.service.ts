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
    const result = await super.create(createDto);
    if (result.isSuccess) {
      this.trazaRepository.save(traza);
    }
    const dto = new IdDto();
    dto.id = createDto.solicitud;
    const solicitud = await this.solicitudesRepository.findOneBy({
      id: dto.id,
    });
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

    // Cambiar estado de la orden
    order.estado = dto.newOrderState;
    await this.repository.save(order);

    // Cambiar estado de la solicitud asociada
    if (order.solicitud) {
      order.solicitud.estado = dto.newRequestState;
      await this.solicitudesRepository.save(order.solicitud);
    }

    // Guardar traza
    await this.trazaRepository.save(traza);

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

  async CloseOrder(dto: CloseOrdenDto, traza: CreateTrazaDto) {
    const returnDto = new ReturnDto();

    const order = await this.repository.findOne({
      where: { id: dto.id }
    });
    if (!order) {
      returnDto.isSuccess = false;
      returnDto.errorMessage = 'Orden no encontrada';
      return returnDto;
    }
    order.estado = dto.estado;
    order.nota = dto.nota;
    await this.repository.save(order);

    const solicitud = await this.solicitudesRepository.findOne({
      where: { id: order.solicitud.id }
    });
    if(dto.estado === EstadoEnum.REALIZADA) {
    solicitud.estado = EstadoEnum.REALIZADA;
    }
    else
     solicitud.estado = EstadoEnum.NO_POSIBLE;
    await this.solicitudesRepository.save(solicitud);

    this.trazaRepository.save(traza);
    returnDto.data = order;
    returnDto.isSuccess = true;
    return returnDto;
  }

  async InExecutionOrder(dto: IdDto, traza: CreateTrazaDto) {
    const returnDto = new ReturnDto();
    const order = await this.repository.findOne({
      where: { id: dto.id }
    });
    if (!order) {
      returnDto.isSuccess = false;
      returnDto.errorMessage = 'Orden no encontrada';
      return returnDto;
    }
    order.estado = EstadoEnum.EN_EJECUCION;
    await this.repository.save(order);
    const solicitud = await this.solicitudesRepository.findOne({
      where: { id: order.solicitud.id }
    });
    solicitud.estado = EstadoEnum.EN_EJECUCION;
    await this.solicitudesRepository.save(solicitud);
    this.trazaRepository.save(traza);
    returnDto.data = order;
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