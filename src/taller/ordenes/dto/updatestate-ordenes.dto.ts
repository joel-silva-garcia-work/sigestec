import { IsNotEmpty, IsEnum } from 'class-validator';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';
import { IdDto } from 'src/common/base/dto/id.dto';
import { EstadoEnum } from '../enum/estado.enum';
import { SolEstadoEnum } from 'src/taller/solicitudes/enum/estado.enum';

export class UpdateStateOrdenesDto extends IdDto {

  @IsNotEmpty({message: DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY.message})
  @IsEnum(EstadoEnum, {message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_ENUM.message})
  newOrderState: EstadoEnum; 

  userID?: string;
  newRequestState?: SolEstadoEnum

}
