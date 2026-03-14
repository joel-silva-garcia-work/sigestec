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
import { ProfileUserDto } from './dto/profile-user.dto';
import { ReturnDto } from 'src/common/base/dto';
import { CodeEnum } from 'src/common/enum/code.enum';
import * as argon from 'argon2';
import { ResetPaswdDto } from './dto/reset-password.dto';

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
    // falta el hash
    //generate the password hash
    createDto.hash = await argon.hash(createDto.password);
    const result = await super.create(createDto);
    if (result.isSuccess) {
      // traza.traza = result.data ? (result.data as User).toRecord() : result.data;
      this.trazaRepository.save(traza);
    }
    return result;
  }

  async Edit(updateDto: UpdateUserDto, traza: CreateTrazaDto) {
    const result = await super.update(updateDto);
    if (result.isSuccess) {
      traza.traza = result.data //? (result.data as User).toRecord() : result.data;
      this.trazaRepository.save(traza);
    }
    return result;
  }

  async State(dto: IdDto, traza: CreateTrazaDto) {
    const result = await super.active(dto);
    if (result.isSuccess) {
      // traza.traza = result.data ? (result.data as User).toRecord() : result.data;
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

  async Profile(dto: ProfileUserDto, traza: CreateTrazaDto) {

    if(dto.password != dto.confirmation)
    {
      const returnDto = new ReturnDto
      returnDto.isSuccess = false
      returnDto.errorCode = 400
      returnDto.returnCode = CodeEnum.BAD_REQUEST
      returnDto.errorMessage = "La confirmacion no es igual al password nuevo"
      return returnDto
    }

    const user = await this.repository.findOneBy({
      id: dto.id,
    });
    if (!user)
      {
        const returnDto = new ReturnDto
        returnDto.errorCode = 400
        returnDto.returnCode = CodeEnum.BAD_REQUEST
        returnDto.errorMessage = "El usuario no existe"
        return returnDto
      }
    user.hash = await argon.hash(dto.password);

    await this.repository.save(user)

    const result = await super.active(dto);
    if (result.isSuccess) {
      // traza.traza = result.data ? (result.data as User).toRecord() : result.data;
      this.trazaRepository.save(traza);
    }
    return result;
  }

  async ResetPswd(dto: ResetPaswdDto, traza: CreateTrazaDto) {

    const user = await this.repository.findOneBy({
      id: dto.id,
    });
    if (!user)
      {
        const returnDto = new ReturnDto
        returnDto.errorCode = 400
        returnDto.returnCode = CodeEnum.BAD_REQUEST
        returnDto.errorMessage = "El usuario no existe"
        return returnDto
      }
    user.hash = await argon.hash(dto.password);

    const result = await this.repository.save(user);
    if (result) {
      // traza.traza = result.data ? (result.data as User).toRecord() : result.data;
      this.trazaRepository.save(traza);
      const returnDto = new ReturnDto
        returnDto.isSuccess = true
        return returnDto
    }
    return result;
  }
}