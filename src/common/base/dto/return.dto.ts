import { CodeEnum } from 'src/common/enum/code.enum';
import { MultilanguageDto } from './multilanguage.dto';

export class ReturnDto {
  isSuccess: boolean = true;
  returnCode: number = CodeEnum.OK;
  data?: Object;
  errorCode?: any
  errorMessage?: string;
}
