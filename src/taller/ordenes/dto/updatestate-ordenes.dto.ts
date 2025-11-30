import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseExtendedDto } from 'src/common/base/dto/base.dto';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';
import { BasicEntity } from 'src/common/base/entities';
import { IdDto } from 'src/common/base/dto/id.dto';
import { EstadoEnum } from '../enum/estado.enum';

export class UpdateStateOrdenesDto extends IdDto {

  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsEnum(EstadoEnum, {message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_ENUM.message})
  newOrderState: EstadoEnum; 

  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsEnum(EstadoEnum, {message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_ENUM.message})
  newRequestState: EstadoEnum

}
