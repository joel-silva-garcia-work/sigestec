import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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

  @UseGuards(JwtGuard)
  @Get('all')
  async findAll() {
    return await this.notificationsService.GetAll();
  }

  @UseGuards(JwtGuard)
  @Post('read')
  async updateReadStatus(@Body() dto: UpdateStateNotificationDto) {
    return this.notificationsService.updateReadStatus(dto);
  }
}
