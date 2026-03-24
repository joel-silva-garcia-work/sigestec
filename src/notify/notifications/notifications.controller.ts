import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UpdateStateNotificationDto } from './dto/update-read-notification.dto';
import { JwtGuard } from '../../security/auth/guard';
import { GetUser } from '../../security/auth/decorator';
import { User } from '../../security/user/entities/user.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // @UseGuards(JwtGuard)
  @Get('all-own-notifications')
  async findAll(dto:IdDto) {
    return await this.notificationsService.GetAllOwnNotifications(dto);
  }

   // @UseGuards(JwtGuard)
   @Put('read')
   async updateReadStatus(@Body() dto: UpdateStateNotificationDto) {
    if(dto.notificationId== "")
     return this.notificationsService.ReadNotification(dto);
    else 
    return this.notificationsService.ReadAllNotification(dto)
   }


}
