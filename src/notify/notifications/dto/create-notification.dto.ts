import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { DestinationType } from "./../../../common/base/types/destination.type";
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
    DestinyID: string  

    @ApiProperty({ type:Boolean, default: true })
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    Order: boolean  

    @ApiProperty({ type:String })
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    ObjectID: string  



    @ApiProperty({})
    @IsEnum(notifyEnum)
    @IsNotEmpty()
    destinyType: notifyEnum

    @ApiProperty({
        type:String
        }
    )
    message: string
    
    //quitar
    @ApiProperty({
        isArray:true
    })
    @IsArray()
    destinyUser: DestinationType[]


}
