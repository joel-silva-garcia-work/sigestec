import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';

export class MultilanguageDto {

  @ApiProperty()
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  es?: string;

  @ApiProperty()
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  en?: string;

  [index: string]: string;
}
