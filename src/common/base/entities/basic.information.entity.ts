import { Column } from 'typeorm';
import { BasicEntity } from './basic.entity';

export abstract class BasicInformationEntity
  extends BasicEntity
{
  @Column({ nullable: false, length: 100 })
  name: string;

  @Column( { nullable: true, length: 255 })
  description: string;

}
