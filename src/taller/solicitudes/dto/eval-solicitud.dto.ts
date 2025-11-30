
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseExtendedDto } from 'src/common/base/dto/base.dto';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';
import { IdDto } from 'src/common/base/dto/id.dto';
import { EvalEnum } from '../enum/eval.enum';

export class EvalSolicitudDto extends IdDto {

  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsEnum(EvalEnum, {message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_ENUM.message})  
  @ApiProperty({enum: EvalEnum, description: 'Evaluación de la solicitud'})
  evaluacion: EvalEnum;

  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  nota: string;

}
