import { Repository } from 'typeorm';

export class CrudDto {
  repo: Repository<any>;
  id?: string;
}
