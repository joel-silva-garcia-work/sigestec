import { ApiProperty } from "@nestjs/swagger";
import { MultilanguageDto } from "./multilanguage.dto";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { DTO_MESSAGES } from "src/common/resource/dto.messages";
import { RulesDto } from "./rules.dto";

export class BaseMultilingualExtendedDto {

    @ApiProperty({type: String})
    @IsString()
    id?: string;

    @ApiProperty({ type: () => MultilanguageDto })
    name: MultilanguageDto  = { es: null, en: null };

    @ApiProperty({ type: () => MultilanguageDto })
    description: MultilanguageDto  = { es: null, en: null };

    @ApiProperty({ required: false, default: true })
    @IsOptional()
    @IsBoolean({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_BOOLEAN.message})
    isActive?: boolean = true;

    @ApiProperty({ required: false })
    @IsOptional()
    rules?: RulesDto;
}

