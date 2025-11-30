import { Column } from 'typeorm';
import { BasicInformationEntity } from './basic.information.entity';

export abstract class ExtendedEntity
  extends BasicInformationEntity
{

  @Column({ default: false })
  isUsed: boolean;
}
