import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BasicInformationEntity } from '../../../common/base/entities';
import { Departamentos } from '../../../comun/departamentos/entities/departamentos.entity';
import { Equipos } from '../../../comun/equipos/entities/equipos.entity';
import { User } from '../../../security/user/entities/user.entity';
import { Solicitudes } from '../../../taller/solicitudes/entities/solicitudes.entity';

@Entity({ name: 'aft', schema: 'comun' })
export class Aft extends BasicInformationEntity {
  @ManyToOne(() => Equipos, equipo => equipo.afts,{eager:true})
  @JoinColumn({ name: 'equipo_id' })
  equipo: Equipos;
  
  @ManyToOne(() => Departamentos, departamento => departamento.afts,{eager:true})
  @JoinColumn({ name: 'departamento_id' })
  departamento: Departamentos;

  @ManyToOne(() => User, user => user.afts,{eager:true})
  @JoinColumn({ name: 'user_id' })
  user: User; 

  @OneToMany(() => Solicitudes, solicitud => solicitud.aft)
  solicitudes: Solicitudes[];
}
