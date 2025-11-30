import { PartialType } from '@nestjs/swagger';
import { CreateSolicitudesDto } from './create-solicitudes.dto';

export class UpdateSolicitudesDto extends PartialType(CreateSolicitudesDto) {}
