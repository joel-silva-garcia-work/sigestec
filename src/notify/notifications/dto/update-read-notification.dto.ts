import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmpty, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateStateNotificationDto {
    @ApiProperty()
    @IsOptional()
    notificationId?: string = ""

    @ApiProperty()
    // @IsString()
    // @IsUUID()
    @IsOptional()
    destinationId?: string


    isRead: boolean = true



    

}
