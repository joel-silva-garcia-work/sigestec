import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsStrongPassword, IsUUID } from 'class-validator';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';

export class LogOutDto {



  @ApiProperty()
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsUUID(undefined, {message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_UUID.message})
  id: string;

}
