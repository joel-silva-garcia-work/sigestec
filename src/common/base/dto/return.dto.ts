import { CodeEnum } from '../../../common/enum/code.enum';

export class ReturnDto<T = any> {
  isSuccess: boolean = true;
  returnCode: number = CodeEnum.OK;
  data?: T;
  errorCode?: any
  errorMessage?: string;
}
