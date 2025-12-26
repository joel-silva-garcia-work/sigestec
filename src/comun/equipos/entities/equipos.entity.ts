import { Entity, Column, OneToMany } from 'typeorm';
import { BasicInformationEntity } from '../../../common/base/entities';
import { Aft } from '../../../comun/aft/entities/aft.entity';

@Entity({ name: 'equipos', schema: 'comun' })
export class Equipos extends BasicInformationEntity {

    @OneToMany(() => Aft, aft => aft.equipo)
    afts: Aft[];
}
