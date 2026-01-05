
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsStrongPassword } from 'class-validator';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';
import { ApiProperty } from '@nestjs/swagger';
import { IdDto } from 'src/common/base/dto/id.dto';

export class ResetPaswdDto extends IdDto {


  hash: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1 ,
    minSymbols: 1 ,
    minUppercase: 1,  
  })
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  password: string;
}
