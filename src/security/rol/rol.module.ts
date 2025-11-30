import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Rol,User]),
    UserModule,
  ],
  controllers: [RolController],
  providers: [RolService],
  exports: [RolService]
})
export class RolModule {}
