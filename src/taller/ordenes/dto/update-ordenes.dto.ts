import { PartialType } from '@nestjs/swagger';
import { CreateOrdenesDto } from './create-ordenes.dto';

export class UpdateOrdenesDto extends PartialType(CreateOrdenesDto) {}
