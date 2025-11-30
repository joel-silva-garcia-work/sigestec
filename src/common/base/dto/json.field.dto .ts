import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { MultilanguageDto } from "./multilanguage.dto";


export class JsonFieldDto {


  @ApiPropertyOptional()
  @IsOptional()
  language: MultilanguageDto;


}
