import { Controller } from '@nestjs/common';
import { BaseControllerCRUD } from 'src/common/base/class/base.controller.crud.class';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateRolDto, UpdateRolDto, UpdateRolWithPermissionsDto } from './dto';
import { RolService } from './rol.service';
import {
  Body,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { IdDto } from 'src/common/base/dto/id.dto';
import { RouteAccessGuard } from 'src/common/guards/route-access.guard';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '../user/entities/user.entity';
import { Request } from 'express';

@ApiTags('rol')
@Controller('rol')
export class RolController extends BaseControllerCRUD<
CreateRolDto,
UpdateRolDto,
RolService
> {
  constructor(private readonly Service: RolService) {
    super(Service);
  }

  @UseGuards(JwtGuard)
  @Get('todos')
  override async findItems(@GetUser() user: User) {
    return super.findItems();
  }

  @UseGuards(RouteAccessGuard)
  @Get(['ver-todos-activos-secure', 'ver-todos-activos-public'])
  override async findActiveItems(@GetUser() user: User) {
    return super.findActiveItems();
  }

  @UseGuards(JwtGuard)
  @Post('adicionar')
  override async create(
  @Body(new ValidationPipe({ transform: true }))
  createDto: CreateRolDto,
  @GetUser() user: User) {
    return super.create(createDto);
  }

  @UseGuards(JwtGuard)
  @Patch('editar')
  override async update(
  @Body(new ValidationPipe({ transform: true }))
  updateDto: UpdateRolDto,
  @GetUser() user: User) {
    return super.update(updateDto);
  }

  @UseGuards(JwtGuard)
  @Delete('eliminar')
  override async remove(
  @Body(new ValidationPipe({ transform: true }))
  dto: IdDto,
  @GetUser() user: User) {
    return super.remove(dto);
  }

  @UseGuards(JwtGuard)
  @Put('cambiar-estado')
  override async active(
  @Body(new ValidationPipe({ transform: true }))
  dto: IdDto,
  @GetUser() user: User) {
    return await super.active(dto);
  }
}