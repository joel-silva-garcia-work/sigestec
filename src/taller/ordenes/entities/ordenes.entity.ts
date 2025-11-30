import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { BasicInformationEntity } from 'src/common/base/entities';
import { User } from 'src/security/user/entities/user.entity';
import { EstadoEnum } from '../enum/estado.enum';
import { Solicitudes } from 'src/taller/solicitudes/entities/solicitudes.entity';

@Entity({ name: 'ordenes', schema: 'taller' })
export class Ordenes extends BasicInformationEntity {

  @ManyToOne(() => User, {eager:true, nullable: true})
  // //(user) => user.tecnicos)
  // @JoinColumn({ name: 'user' })
  tecnico: User;  

  @OneToOne(()=> Solicitudes,{eager: true,nullable:false})
  solicitud: Solicitudes

  @Column({
    enum:EstadoEnum,
    default:EstadoEnum.ASIGNADA
  })
  estado: EstadoEnum;

  @Column()
  nota: string;
}
