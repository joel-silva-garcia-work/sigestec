import { Entity, Column, OneToMany } from 'typeorm';
import { BasicInformationEntity } from 'src/common/base/entities';
import { Aft } from 'src/comun/aft/entities/aft.entity';

@Entity({ name: 'departamentos', schema: 'comun' })
export class Departamentos extends BasicInformationEntity {

  @OneToMany(() => Aft, aft => aft.departamento)
  afts: Aft[];

}
