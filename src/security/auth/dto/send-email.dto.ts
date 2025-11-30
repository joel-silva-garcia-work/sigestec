import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';

export class SendMailDto  {
    
    @ApiProperty()
    @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
    from: string;
    
    @ApiProperty()
    @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
    message: string;

}
