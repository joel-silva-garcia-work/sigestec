import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Traza } from '../trazas/entities/traza.entity';
import { Rol } from '../rol/entities/rol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Traza,Rol])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
