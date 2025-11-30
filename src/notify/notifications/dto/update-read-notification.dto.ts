import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class UpdateStateNotificationDto {
    @ApiProperty()
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    notificationId: string

    @ApiProperty()
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    destinationId: string

    @IsBoolean()
    isReaded: boolean

}
