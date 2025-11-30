import {
  Body,
  Get,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { ReturnDto } from '../dto';
import { CrudService } from '../interfaces/crud.service';
import {
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiBody,
} from '@nestjs/swagger';
import { IdDto } from '../dto/id.dto';

export class BaseControllerCRUD<
  TCreateDto,
  TUpdateDto,
  TService extends CrudService<TCreateDto, TUpdateDto>,
> {
  constructor(private readonly service: TService) {}

  // Métodos públicos expuestos como endpoints
  @Get('todos')
  async findItems(securityParam?: any): Promise<ReturnDto> {
    return this.service.findAllItems();
  }

  @Get('obtener-uno')
  @ApiOperation({ summary: 'Obtener un item por ID' })
  @ApiResponse({
    status: 200,
    description: 'Item obtenido exitosamente',
    type: ReturnDto,
  })
  @ApiBadRequestResponse({
    description: 'Error de validación o datos incorrectos.',
  })
  @ApiBody({ type: IdDto, description: 'ID del elemento a buscar.' })
  async findOne(@Body(new ValidationPipe({ transform: true })) dto: IdDto, securityParam?: any): Promise<ReturnDto> {
    return this.service.findOne(dto);
  }

  
  @Get('obtener-uno-activo')
  @ApiOperation({ summary: 'Obtener un item por ID' })
  @ApiResponse({
    status: 200,
    description: 'Item obtenido exitosamente',
    type: ReturnDto,
  })
  @ApiBadRequestResponse({
    description: 'Error de validación o datos incorrectos.',
  })
  @ApiBody({ type: IdDto, description: 'ID del elemento a buscar.' })
  async findOneActive(@Body(new ValidationPipe({ transform: true })) dto: IdDto, securityParam?: any): Promise<ReturnDto> {
    return this.service.findOneActive(dto);
  }

  @Get('todos-activos')
  async findActiveItems(securityParam?: any): Promise<ReturnDto> {
    return this.service.findActiveItems();
  }

    // Método público para activar
    @Put('cambiar-estado')
    @ApiOperation({ summary: 'Activar un elemento' })
    @ApiResponse({
      status: 200,
      description: 'El elemento ha sido activado con éxito.',
      type: ReturnDto,
    })
    @ApiBadRequestResponse({
      description: 'Error de validación o datos incorrectos.',
    })
    @ApiBody({ type: IdDto, description: 'ID del elemento a activar.' })
    async active(
      @Body(new ValidationPipe({ transform: true })) IdDto: IdDto,
      securityParam?: any,
    ): Promise<ReturnDto> {
      return await this.service.active(IdDto);
    }

  // Métodos protegidos, NO expuestos como endpoints
  protected async create(createDto: TCreateDto, securityParam?: any): Promise<ReturnDto> {
    return this.service.create(createDto);
  }

  protected async update(updateDto: TUpdateDto, securityParam?: any): Promise<ReturnDto> {
    return this.service.update(updateDto);
  }

  protected async remove(IdDto: IdDto, securityParam?: any): Promise<ReturnDto> {
    return this.service.remove(IdDto);
  }
}
