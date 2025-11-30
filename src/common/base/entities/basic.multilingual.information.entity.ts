import { Column } from 'typeorm';
import { MultilanguageType } from '../types/multilanguage.type';
import { BasicEntity } from './basic.entity';

export abstract class BasicMultilingualInformationEntity
  extends BasicEntity
{
  @Column('json', { nullable: true })
  name: MultilanguageType;

  @Column('json', { nullable: true })
  description: MultilanguageType;

}
