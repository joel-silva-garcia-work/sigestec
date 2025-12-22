import { PartialType } from '@nestjs/swagger';
import { CreateAftDto } from './create-aft.dto';

export class UpdateAftDto extends PartialType(CreateAftDto) {}
