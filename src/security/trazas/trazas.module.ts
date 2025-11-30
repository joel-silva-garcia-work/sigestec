import { Module } from '@nestjs/common';
import { TrazaService } from './trazas.service';
import { TrazaController } from './trazas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Traza } from './entities/traza.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Traza])],
  controllers: [TrazaController],
  providers: [TrazaService],
})
export class TrazasModule {}
