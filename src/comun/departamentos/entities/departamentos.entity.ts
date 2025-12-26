import { Entity, Column, OneToMany } from 'typeorm';
import { BasicInformationEntity } from '../../../common/base/entities';
import { Aft } from '../../../comun/aft/entities/aft.entity';

@Entity({ name: 'departamentos', schema: 'comun' })
export class Departamentos extends BasicInformationEntity {

  @OneToMany(() => Aft, aft => aft.departamento)
  afts: Aft[];

}
