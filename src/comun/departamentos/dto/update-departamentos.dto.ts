import { PartialType } from '@nestjs/swagger';
import { CreateDepartamentosDto } from './create-departamentos.dto';

export class UpdateDepartamentosDto extends PartialType(CreateDepartamentosDto) {}
