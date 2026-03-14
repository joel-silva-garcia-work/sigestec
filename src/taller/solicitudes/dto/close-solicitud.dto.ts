
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DTO_MESSAGES } from '../../../common/resource/dto.messages';
import { IdDto } from '../../../common/base/dto/id.dto';

export class CloseSolicitudDto extends IdDto {

  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  nota: string;

}
