import { PartialType } from '@nestjs/swagger';
import { CreateTrazaDto } from './create-traza.dto';

export class UpdateTrazaDto extends PartialType(CreateTrazaDto) {}
