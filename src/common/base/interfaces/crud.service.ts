// crud.service.ts

import { ReturnDto } from "../dto";
import { IdDto } from "../dto/id.dto";

export interface CrudService<TCreateDto, TUpdateDto> {
  findAllItems(): Promise<ReturnDto>;
  findActiveItems(): Promise<ReturnDto>;
  findOne(dto: IdDto): Promise<ReturnDto>;
  findOneActive(dto: IdDto): Promise<ReturnDto>;
  create(createDto: TCreateDto): Promise<ReturnDto>;
  update(updateDto: TUpdateDto): Promise<ReturnDto>;
  remove(IdDto: IdDto): Promise<ReturnDto>;
  active(dto: IdDto): Promise<ReturnDto>;
}
  