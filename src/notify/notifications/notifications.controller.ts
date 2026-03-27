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
import { IdDto } from 'src/common/base/dto/id.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtGuard)
  @Get('all-own-notifications')
  async findAll(@GetUser() user: User, @Body() dto:IdDto) {
    dto.id = user.id;
    return await this.notificationsService.GetAllOwnNotifications(dto);
  }

   @UseGuards(JwtGuard)
   @Put('read')
   async updateReadStatus(@Body() dto: UpdateStateNotificationDto,
   @GetUser() user: User) {
    dto.destinationId = user.id
     return this.notificationsService.ReadNotification(dto);

   }

   @UseGuards(JwtGuard)
   @Put('read-all')
   async updateAllReadStatus(@Body() dto: UpdateStateNotificationDto,
   @GetUser() user: User) {
    dto.destinationId = user.id
    return this.notificationsService.ReadAllNotification(dto)
   }

}
