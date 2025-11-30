import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';

export class AuthDto {
  @IsEmail({}, {message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_EMAIL.message})
  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  username: string;

  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  password: string;

  
}
