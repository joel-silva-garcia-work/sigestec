import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';

export class RelationalDto {

  @ApiProperty({
    type: String,
    nullable:false
  })
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  @IsUUID(undefined, {message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_UUID.message})
  id: string;
}
