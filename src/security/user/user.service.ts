import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseServiceCRUD } from 'src/common/base/class/base.service.crud.class';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UpdateUserWithRolesDto } from './dto';
import { IdDto } from 'src/common/base/dto/id.dto';
import { Traza } from '../trazas/entities/traza.entity';
import { CreateTrazaDto } from '../trazas/dto/create-traza.dto';
import { Rol } from '../rol/entities/rol.entity';

@Injectable()
export class UserService extends BaseServiceCRUD<
User,
CreateUserDto,
UpdateUserDto> {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(Traza)
    private readonly trazaRepository: Repository<Traza>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {
    super(repository)
  }

  override async findAllItems() {
    return super.findAllItems();
  }

  override async findActiveItems() {
    return super.findActiveItems();
  }

  async Add(createDto: CreateUserDto, traza: CreateTrazaDto) {
    const result = await super.create(createDto);
    if (result.isSuccess) {
      traza.traza = result.data ? (result.data as User).toRecord() : result.data;
      this.trazaRepository.save(traza);
    }
    return result;
  }

  async Edit(updateDto: UpdateUserDto, traza: CreateTrazaDto) {
    const result = await super.update(updateDto);
    if (result.isSuccess) {
      traza.traza = result.data ? (result.data as User).toRecord() : result.data;
      this.trazaRepository.save(traza);
    }
    return result;
  }



  async State(dto: IdDto, traza: CreateTrazaDto) {
    const result = await super.active(dto);
    if (result.isSuccess) {
      traza.traza = result.data ? (result.data as User).toRecord() : result.data;
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