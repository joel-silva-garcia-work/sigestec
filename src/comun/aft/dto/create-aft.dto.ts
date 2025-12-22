import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsDate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseExtendedDto } from 'src/common/base/dto/base.dto';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';

export class CreateAftDto extends BaseExtendedDto {
  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  equipo: string;

  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  departamentos: string;
}
