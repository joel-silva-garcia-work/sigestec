import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ordenes } from './entities/ordenes.entity';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { Traza } from 'src/security/trazas/entities/traza.entity';
import { Solicitudes } from '../solicitudes/entities/solicitudes.entity';
import { SolicitudesModule } from '../solicitudes/solicitudes.module';
import { User } from 'src/security/user/entities/user.entity';
import { UserModule } from 'src/security/user/user.module';
import { Notification } from 'src/notify/notifications/entities/notification.entity';
import { NotificationsModule } from 'src/notify/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ordenes, Traza,Solicitudes,User,Notification]),
    SolicitudesModule,
    UserModule,
    NotificationsModule
  ],
  controllers: [OrdenesController],
  providers: [OrdenesService],
  exports: [OrdenesService]
})
export class OrdenesModule {}
