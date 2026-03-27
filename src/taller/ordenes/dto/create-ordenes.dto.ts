import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { BaseDto, BaseExtendedDto } from './../../../common/base/dto/base.dto';
import { DTO_MESSAGES, withDtoContext } from './../../../common/resource/dto.messages';
import { EstadoEnum } from '../enum/estado.enum'
export class CreateOrdenesDto extends BaseDto {
  @IsNotEmpty(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY))
  @IsString(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING))
  @IsUUID(undefined, withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_UUID))
  tecnico: string;

 

  @IsNotEmpty(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY))
  @IsString(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING))
  notaJT: string;

  @IsNotEmpty(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY))
  @IsString(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING))
  @IsUUID(undefined, withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_UUID))
  solicitud: string;

   // @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  // @IsEnum(EstadoEnum)
  estado: EstadoEnum=EstadoEnum.ASIGNADA;

  userID: string;

}
