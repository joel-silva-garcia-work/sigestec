import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitudes } from './entities/solicitudes.entity';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesController } from './solicitudes.controller';
import { Traza } from 'src/security/trazas/entities/traza.entity';
import { Notification } from 'src/notify/notifications/entities/notification.entity';
import { User } from 'src/security/user/entities/user.entity';
import { Ordenes } from '../ordenes/entities/ordenes.entity';
import { Configuration } from 'src/config/configuration/entities/configuration.entity';
import { NotificationsModule } from 'src/notify/notifications/notifications.module';
import { NotificationsService } from 'src/notify/notifications/notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Solicitudes, Traza, Notification, User, Ordenes, Configuration, Notification])
  ],
  controllers: [SolicitudesController],
  providers: [SolicitudesService,NotificationsService],
  exports: [SolicitudesService]
})
export class SolicitudesModule {}
