import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipos } from './entities/equipos.entity';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';
import { Traza } from 'src/security/trazas/entities/traza.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipos, Traza])
  ],
  controllers: [EquiposController],
  providers: [EquiposService],
  exports: [EquiposService]
})
export class EquiposModule {}
