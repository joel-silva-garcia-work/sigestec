import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseExtendedDto } from './../../../common/base/dto/base.dto';
import { DTO_MESSAGES } from './../../../common/resource/dto.messages';
import { TipoEnum } from '../enum/tipo.enum';
import { SolEstadoEnum } from '../enum/estado.enum';

export class CreateSolicitudesDto extends BaseExtendedDto {
  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  @IsUUID()
  aft: string;

 @IsOptional()
 @IsUUID()
  solicitante: string;

  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsEnum(TipoEnum)
  tipo: TipoEnum;

  @IsEnum(SolEstadoEnum)
  estado: SolEstadoEnum  = SolEstadoEnum.SOLICITADA;

  codigo: string
}
