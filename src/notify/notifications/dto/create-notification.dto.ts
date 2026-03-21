import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { notifyEnum } from "./../../../common/enum/notify.enum";

export class CreateNotificationDto {
    @ApiProperty()
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    userOrigin: string

    @ApiProperty({ type:String })
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    destinyID: string  

    @ApiProperty({ type:Boolean, default: true })
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    isOrder: boolean  

    @ApiProperty({ type:String })
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    objectID: string  

    @ApiProperty({})
    @IsEnum(notifyEnum)
    @IsNotEmpty()
    destinyType: notifyEnum

    @ApiProperty({
        type:String
        }
    )
    message: string

    isRead: false
}
