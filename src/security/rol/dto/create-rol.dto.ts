import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseExtendedDto } from 'src/common/base/dto/base.dto';

export class CreateRolDto extends BaseExtendedDto {
    
    @ApiProperty({
        description: 'Lista de IDs de permisos a asociar con el rol',
        type: [String],
        required: false
    })
    @IsNotEmpty({ each: true })
    @IsString({ each: true })
    permissions?: string[];
}
