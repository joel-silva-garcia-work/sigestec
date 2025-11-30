import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseServiceCRUD } from 'src/common/base/class/base.service.crud.class';
import { Rol } from './entities/rol.entity';
import { CreateRolDto, UpdateRolDto, UpdateRolWithPermissionsDto } from './dto';
import { IdDto } from 'src/common/base/dto/id.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class RolService extends BaseServiceCRUD<
Rol,
CreateRolDto,
UpdateRolDto> {
  constructor(
    @InjectRepository(Rol)
    private readonly repository: Repository<Rol>,
  ) {
    super(repository)
  }

  override async findAllItems() {
    return super.findAllItems();
  }

  override async findActiveItems() {
    return super.findActiveItems();
  }

  override async create(createDto: CreateRolDto) {
    // Crear el rol primero
    const result = await super.create(createDto);
    return result;
  }

  override async update(updateDto: UpdateRolDto) {
    return super.update(updateDto);
  }


  override async remove( dto: IdDto) {
    return super.remove(dto);
  }

  override async active(dto: IdDto) {
    return super.active(dto);
  }
}