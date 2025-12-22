import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aft } from './entities/aft.entity';
import { AftService } from './aft.service';
import { AftController } from './aft.controller';
import { Traza } from 'src/security/trazas/entities/traza.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aft, Traza])
  ],
  controllers: [AftController],
  providers: [AftService],
  exports: [AftService]
})
export class AftModule {}
