import { Injectable } from '@nestjs/common';
import { BaseServiceCRUD } from '../../common/base/class/base.service.crud.class';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ReturnDto } from '../../common/base/dto';
import { CodeEnum } from '../../common/enum/code.enum';
import { UpdateStateNotificationDto } from './dto/update-read-notification.dto';
import { IdDto } from 'src/common/base/dto/id.dto';

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

  override async create(createDto: CreateNotificationDto) {
    console.log(createDto)
    const result = await super.create(createDto);
    return result;
  }

  async ReadAllNotification(dto: UpdateStateNotificationDto): Promise<ReturnDto> {
    const returnDto = new ReturnDto();

    const notifications = await this.repository.findBy({
      destinyID: dto.destinationId 
    });

    returnDto.isSuccess = false
    returnDto.returnCode = CodeEnum.NOT_FOUND

    if(notifications != null )
    {
      notifications.forEach(async (notification) => {
        notification.isRead= true,
        await this.repository.save(notification)
      }) 
      returnDto.isSuccess = true
      returnDto.returnCode = CodeEnum.OK
    }
    return returnDto
  }

  async ReadNotification(dto: UpdateStateNotificationDto): Promise<ReturnDto> {
    const returnDto = new ReturnDto();

    const notification = await this.repository.findOne({
      where:{id: dto.notificationId} 
    });

    returnDto.isSuccess = false
    returnDto.returnCode = CodeEnum.NOT_FOUND

    if(notification != null )
    {
      notification.isRead= true,
      await this.repository.save(notification)

      returnDto.isSuccess = true
      returnDto.returnCode = CodeEnum.OK
    }
    return returnDto
  }

  // async updateSolicitudReadStatus(dto: UpdateStateNotificationDto): Promise<ReturnDto> {
  //   const returnDto = new ReturnDto();
  //   const notification = await this.repository.findOne({
  //     where: { id: dto.notificationId },
  //   });

  //   if (!notification) {
  //     returnDto.isSuccess = false;
  //     returnDto.errorMessage = 'Notification not found';
  //     returnDto.returnCode = CodeEnum.NOT_FOUND;
  //     return returnDto;
  //   }

  //   const destination = notification.destinyUser.find(
  //     (dest) => dest.id === dto.destinationId,
  //   );

  //   if (!destination) {
  //     returnDto.isSuccess = false;
  //     returnDto.errorMessage = 'Destination not found in notification';
  //     returnDto.returnCode = CodeEnum.NOT_FOUND;
  //     return returnDto;
  //   }

  //   destination.isSolititudRead = dto.isReaded;
  //   returnDto.isSuccess = true;
  //   returnDto.data = await this.repository.save(notification);
  //   return returnDto;
  // }

  // async updateOrderReadStatus(dto: UpdateStateNotificationDto): Promise<ReturnDto> {
  //   const returnDto = new ReturnDto();
  //   const notification = await this.repository.findOne({
  //     where: { id: dto.notificationId },
  //   });

  //   if (!notification) {
  //     returnDto.isSuccess = false;
  //     returnDto.errorMessage = 'Notification not found';
  //     returnDto.returnCode = CodeEnum.NOT_FOUND;
  //     return returnDto;
  //   }

  //   const destination = notification.destinyUser.find(
  //     (dest) => dest.id === dto.destinationId,
  //   );

  //   if (!destination) {
  //     returnDto.isSuccess = false;
  //     returnDto.errorMessage = 'Destination not found in notification';
  //     returnDto.returnCode = CodeEnum.NOT_FOUND;
  //     return returnDto;
  //   }

  //   destination.isOrderRead = dto.isReaded;
  //   returnDto.isSuccess = true;
  //   returnDto.data = await this.repository.save(notification);
  //   return returnDto;
  // }
  async GetAllOwnNotifications(dto:IdDto): Promise<ReturnDto> {
    const returnDto = new ReturnDto();
    const notification = await this.repository.find({
      where: {
        destinyID: dto.id
      }
    });
    returnDto.data = notification;
    returnDto.isSuccess = true;
    returnDto.returnCode = CodeEnum.OK;
    return returnDto;
  }   
}