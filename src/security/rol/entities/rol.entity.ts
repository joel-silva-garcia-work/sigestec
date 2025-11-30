import { Entity, Column, OneToMany } from 'typeorm';
import { BasicInformationEntity } from 'src/common/base/entities';


@Entity({ name: 'rol', schema: 'security' })
export class Rol extends BasicInformationEntity {


  toRecord(): Record<string, any> {
    return {
      name: this.name,
      description: this.description
    };
  }
}
