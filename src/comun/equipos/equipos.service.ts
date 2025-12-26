import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseServiceCRUD } from 'src/common/base/class/base.service.crud.class';
import { Equipos } from './entities/equipos.entity';
import { CreateEquiposDto, UpdateEquiposDto } from './dto';
import { IdDto } from 'src/common/base/dto/id.dto';
import { Traza } from 'src/security/trazas/entities/traza.entity';
import { CreateTrazaDto } from 'src/security/trazas/dto/create-traza.dto';


@Injectable()
export class EquiposService extends BaseServiceCRUD<
Equipos,
CreateEquiposDto,
UpdateEquiposDto> {
  constructor(
    @InjectRepository(Equipos)
    private readonly repository: Repository<Equipos>,
    @InjectRepository(Traza)
    private readonly trazaRepository: Repository<Traza>,
  ) {
    super(repository)
  }

  override async findAllItems() {
    return await super.findAllItems();
  }


  override async findActiveItems() {
    return await super.findActiveItems();
  }

  override async findOne(id: IdDto) {
    return await super.findOne(id);
  }

  async Add(createDto: CreateEquiposDto, traza: CreateTrazaDto) {
    const result = await super.create(createDto);
    if (result.isSuccess) {
      await this.trazaRepository.save(traza);
    }
    return result;
  }

  async Edit(updateDto: UpdateEquiposDto, traza: CreateTrazaDto) {
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

}