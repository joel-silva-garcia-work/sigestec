import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmpty, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateStateNotificationDto {
    @ApiProperty()
    @IsString()
    @IsUUID()
    @IsOptional()
    notificationId?: string = ""

    @ApiProperty()
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    destinationId: string

    @IsBoolean()
    @IsOptional()
    isRead?: boolean

    //Quitar
    @IsBoolean()
    isReaded: boolean

    

}
