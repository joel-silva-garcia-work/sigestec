// src/traza/traza.entity.ts

import { BasicEntity } from 'src/common/base/entities';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'traza', schema: 'security' })
export class Traza extends BasicEntity { 

  @Column()
  ip: string;

  @Column()
  url: string;

  @Column({nullable: true})
  user: string;

  @Column({ type: 'json' })
  traza: Record<string, any>; // Campo JSON para almacenar los datos de seguimiento

  toRecord(): Record<string, any> {
    return {
      name: '',
      description: '',
      ip: this.ip,
      url: this.url,
      user: this.user,
      traza: this.traza
    };
  }
}
