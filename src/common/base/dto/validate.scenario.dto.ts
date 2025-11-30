import { IFieldType } from '../types/IFieldType';

export class ValidateScenarioDto {
  table: string;
  field: string;
  value: IFieldType;
}
