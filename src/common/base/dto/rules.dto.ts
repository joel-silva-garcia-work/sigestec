import { MethodEnum } from '../../../common/enum/method.enum';
import { KindEnum } from '../../../common/enum/kind.enum';

export class RulesDto {
  method: MethodEnum;
  comparisonKind: KindEnum;
  field: string[];
}
