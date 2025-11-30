import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
 
export abstract class BasicEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @UpdateDateColumn({ type: 'timestamp', default: new Date() })
  updatedAt: Date

  @CreateDateColumn({ type: 'timestamp', default: new Date() })
  createdAt: Date

  //NOTE: '_' prefix is for hidden control fields
  @DeleteDateColumn({
    name: '_deleted_at',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  deletedAt?: Date 
  
  @Column({ default: true })
  isActive: boolean;
}
