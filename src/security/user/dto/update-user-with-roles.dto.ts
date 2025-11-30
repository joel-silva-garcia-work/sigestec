import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray, IsBoolean } from 'class-validator';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';
import { ApiProperty } from '@nestjs/swagger';
import { BaseExtendedDto } from 'src/common/base/dto/base.dto';

export class UpdateUserWithRolesDto extends BaseExtendedDto {
  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  username: string;

  @IsOptional()
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  hash?: string;

  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  name: string;

  @IsOptional()
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  email?: string;

  @IsOptional()
  @IsBoolean({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_BOOLEAN.message})
  isLogged?: boolean;

  @IsOptional()
  @IsArray({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_ARRAY.message})
  @IsUUID(undefined, {each: true, message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_UUID.message})
  roleIds?: string[];
} 