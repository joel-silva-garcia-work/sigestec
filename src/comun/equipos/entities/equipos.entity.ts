import { Entity, Column } from 'typeorm';
import { BasicInformationEntity } from 'src/common/base/entities';

@Entity({ name: 'equipos', schema: 'comun' })
export class Equipos extends BasicInformationEntity {

}
