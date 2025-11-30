import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ordenes } from './entities/ordenes.entity';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { Traza } from 'src/security/trazas/entities/traza.entity';
import { Solicitudes } from '../solicitudes/entities/solicitudes.entity';
import { SolicitudesModule } from '../solicitudes/solicitudes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ordenes, Traza,Solicitudes]),
    SolicitudesModule,
  ],
  controllers: [OrdenesController],
  providers: [OrdenesService],
  exports: [OrdenesService]
})
export class OrdenesModule {}
