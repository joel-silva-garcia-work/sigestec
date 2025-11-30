import { PartialType } from '@nestjs/swagger';
import { CreateEquiposDto } from './create-equipos.dto';

export class UpdateEquiposDto extends PartialType(CreateEquiposDto) {}
