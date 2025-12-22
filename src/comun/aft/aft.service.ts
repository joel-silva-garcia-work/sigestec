import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseServiceCRUD } from 'src/common/base/class/base.service.crud.class';
import { Aft } from './entities/aft.entity';
import { CreateAftDto, UpdateAftDto } from './dto';
import { IdDto } from 'src/common/base/dto/id.dto';
import { Traza } from 'src/security/trazas/entities/traza.entity';
import { CreateTrazaDto } from 'src/security/trazas/dto/create-traza.dto';


@Injectable()
export class AftService extends BaseServiceCRUD<
Aft,
CreateAftDto,
UpdateAftDto> {
  constructor(
    @InjectRepository(Aft)
    private readonly repository: Repository<Aft>,
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

  async Add(createDto: CreateAftDto, traza: CreateTrazaDto) {
    const result = await super.create(createDto);
    if (result.isSuccess) {
      this.trazaRepository.save(traza);
    }
    return result;
  }

  async Edit(updateDto: UpdateAftDto, traza: CreateTrazaDto) {
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