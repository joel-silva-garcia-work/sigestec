import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseServiceCRUD } from 'src/common/base/class/base.service.crud.class';
import { Departamentos } from './entities/departamentos.entity';
import { CreateDepartamentosDto, UpdateDepartamentosDto } from './dto';
import { IdDto } from 'src/common/base/dto/id.dto';
import { Traza } from 'src/security/trazas/entities/traza.entity';
import { CreateTrazaDto } from 'src/security/trazas/dto/create-traza.dto';


@Injectable()
export class DepartamentosService extends BaseServiceCRUD<
Departamentos,
CreateDepartamentosDto,
UpdateDepartamentosDto> {
  constructor(
    @InjectRepository(Departamentos)
    private readonly repository: Repository<Departamentos>,
    @InjectRepository(Traza)
    private readonly trazaRepository: Repository<Traza>,
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

  async Add(createDto: CreateDepartamentosDto, traza: CreateTrazaDto) {
    const result = await super.create(createDto);
    if (result.isSuccess) {
      this.trazaRepository.save(traza);
    }
    return result;
  }

  async Edit(updateDto: UpdateDepartamentosDto, traza: CreateTrazaDto) {
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