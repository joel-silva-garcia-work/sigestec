import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departamentos } from './entities/departamentos.entity';
import { DepartamentosService } from './departamentos.service';
import { DepartamentosController } from './departamentos.controller';
import { Traza } from 'src/security/trazas/entities/traza.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Departamentos, Traza])
  ],
  controllers: [DepartamentosController],
  providers: [DepartamentosService],
  exports: [DepartamentosService]
})
export class DepartamentosModule {}
