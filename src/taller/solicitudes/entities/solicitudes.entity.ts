import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BasicInformationEntity } from 'src/common/base/entities';
import { TipoEnum } from '../enum/tipo.enum';
import { EstadoEnum } from '../enum/estado.enum';
import { EvalEnum } from '../enum/eval.enum';
import { User } from 'src/security/user/entities/user.entity';
import { Equipos } from 'src/comun/equipos/entities/equipos.entity';

@Entity({ name: 'solicitudes', schema: 'taller' })
export class Solicitudes extends BasicInformationEntity {

  @Column({ nullable: false })
  codigo: string;

  @ManyToOne(() => Equipos, {eager:true, nullable: false})
  // @JoinColumn({ name: 'equipo' })
  equipo: Equipos;

  @ManyToOne(() => User, {eager:true, nullable: true})
  //(user) => user.tecnicos)
  // @JoinColumn({ name: 'user' })
  solicitante: User;


  @Column(
    {
    enum:TipoEnum,
    default: TipoEnum.REPARACION
  }
  )
  tipo: TipoEnum;

  @Column({
    enum:EstadoEnum,
    default:EstadoEnum.SOLICITADA
  })
  estado: EstadoEnum;

  @Column({ nullable: true })
  evaluacion: EvalEnum;

  @Column({ nullable: true })
  nota: string;
}
