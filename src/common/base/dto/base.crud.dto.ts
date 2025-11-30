import { notifyEnum } from 'src/common/enum/notify.enum';
import { RelationalDto } from '.';
import { MultilanguageDto } from './multilanguage.dto';
import { RulesDto } from './rules.dto';

export interface BaseDto {
  id?: string;
  [key: string]: any; // Index signature for accepting any other properties
}

