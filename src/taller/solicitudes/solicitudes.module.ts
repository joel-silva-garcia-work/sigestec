import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitudes } from './entities/solicitudes.entity';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesController } from './solicitudes.controller';
import { Traza } from 'src/security/trazas/entities/traza.entity';
import { Notification } from 'src/notify/notifications/entities/notification.entity';
import { User } from 'src/security/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Solicitudes, Traza, Notification, User])
  ],
  controllers: [SolicitudesController],
  providers: [SolicitudesService],
  exports: [SolicitudesService]
})
export class SolicitudesModule {}
