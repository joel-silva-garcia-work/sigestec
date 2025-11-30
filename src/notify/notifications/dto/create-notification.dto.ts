import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { type } from "os";
import { DestinationType } from "src/common/base/types/destination.type";
import { notifyEnum } from "src/common/enum/notify.enum";

export class CreateNotificationDto {
    @ApiProperty()
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    userOrigin: string

    @ApiProperty({})
    @IsEnum(notifyEnum)
    @IsNotEmpty()
    destinyType: notifyEnum

    @ApiProperty({
        isArray:true
    })
    @IsArray()
    destinyUser: DestinationType[]

    @ApiProperty({
            type:String
        }
    )
    message: string
}
