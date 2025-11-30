import { Injectable } from '@nestjs/common';
import { BaseServiceCRUD } from 'src/common/base/class/base.service.crud.class';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ReturnDto } from 'src/common/base/dto';
import { CodeEnum } from 'src/common/enum/code.enum';
import { UpdateStateNotificationDto } from './dto/update-read-notification.dto';

@Injectable()
export class NotificationsService extends BaseServiceCRUD<
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto
> {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {
    super(repository);
  }
  async updateReadStatus(dto: UpdateStateNotificationDto): Promise<ReturnDto> {
    const returnDto = new ReturnDto();
    const notification = await this.repository.findOne({
      where: { id: dto.notificationId },
    });

    if (!notification) {
      returnDto.isSuccess = false;
      returnDto.errorMessage = 'Notification not found';
      returnDto.returnCode = CodeEnum.NOT_FOUND;
      return returnDto;
    }

    const destination = notification.destinyUser.find(
      (dest) => dest.id === dto.destinationId,
    );

    if (!destination) {
      returnDto.isSuccess = false;
      returnDto.errorMessage = 'Destination not found in notification';
      returnDto.returnCode = CodeEnum.NOT_FOUND;
      return returnDto;
    }

    destination.isReaded = dto.isReaded;
    returnDto.data = this.repository.save(notification);
    return returnDto;
  }
  async GetAll(): Promise<ReturnDto> {
    const returnDto = new ReturnDto();
    const notification = await this.repository.find({});
    returnDto.data = notification;
    return returnDto;
  }
}