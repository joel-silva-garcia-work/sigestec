import { ApiProperty } from "@nestjs/swagger";
import { MultilanguageDto } from "./multilanguage.dto";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { RulesDto } from "./rules.dto";
import { DTO_MESSAGES } from "src/common/resource/dto.messages";

export class BaseExtendedDto {

    @ApiProperty({type: String})

    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty({type: String})

    @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
    @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
    @MaxLength(100, { message: DTO_MESSAGES.VALIDATION.FIELD_MAX_LENGTH.message })
    @MinLength(2, { message: DTO_MESSAGES.VALIDATION.FIELD_MIN_LENGTH.message})
    name: string;

    @ApiProperty({type: String})
    @MaxLength(255, { message: DTO_MESSAGES.VALIDATION.FIELD_MAX_LENGTH_255.message })
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false, default: true })
    @IsOptional()
    @IsBoolean({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_BOOLEAN.message})
    isActive?: boolean = true;

    @ApiProperty({ required: false })
    @IsOptional()
    rules?: RulesDto;
}

export class BaseDto {

    @ApiProperty({type: String})

    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty({ required: false, default: true })
    @IsOptional()
    @IsBoolean({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_BOOLEAN.message})
    isActive?: boolean = true;

    @ApiProperty({ required: false })
    @IsOptional()
    rules?: RulesDto;
}

