import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsDate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseExtendedDto } from 'src/common/base/dto/base.dto';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';

export class CreateEquiposDto extends BaseExtendedDto {

}
