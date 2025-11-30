import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray } from 'class-validator';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';
import { ApiProperty } from '@nestjs/swagger';
import { BaseExtendedDto } from 'src/common/base/dto/base.dto';

export class UpdateRolWithPermissionsDto extends BaseExtendedDto {
  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  name: string;

  @IsOptional()
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  description?: string;

  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsArray({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_ARRAY.message})
  @IsUUID(undefined, {each: true, message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_UUID.message})
  permissionIds: string[];
} 