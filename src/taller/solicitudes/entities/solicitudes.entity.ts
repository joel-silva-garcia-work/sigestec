import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BasicInformationEntity } from './../../../common/base/entities';
import { TipoEnum } from '../enum/tipo.enum';
import { EstadoEnum } from '../enum/estado.enum';
import { EvalEnum } from '../enum/eval.enum';
import { User } from './../../../security/user/entities/user.entity';
import { Aft } from './../../../comun/aft/entities/aft.entity';

@Entity({ name: 'solicitudes', schema: 'taller' })
export class Solicitudes extends BasicInformationEntity {

  @Column({ nullable: false })
  codigo: string;

  @ManyToOne(() => Aft, {eager:true, nullable: true})
  @JoinColumn({ name: 'aft_id' })
  aft: Aft;
  
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
