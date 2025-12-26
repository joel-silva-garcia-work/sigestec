import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BasicInformationEntity } from '../../../common/base/entities';
import { Rol } from '../../../security/rol/entities/rol.entity';
import { Aft } from '../../../comun/aft/entities/aft.entity';

@Entity({ name: 'user', schema: 'security' })
export class User extends BasicInformationEntity {
  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  hash: string;

  @Column()
  name: string;

  
  @Column({nullable:true})
  email: string;

  
  @Column()
  isLogged: boolean;

 
  @ManyToOne(() => Rol, {eager:true})
   rol: Rol;

   @OneToMany(() => Aft, aft => aft.user)
   afts: Aft[];

  toRecord(): Record<string, any> {
    return {
      name: this.name,
      description: this.description,
    };
  }
}
