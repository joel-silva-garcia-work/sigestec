import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { SuperAdminInitService } from './role-init.service';
import { RoleSyncService } from './role-sync.service';


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
