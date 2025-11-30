import { Module, OnModuleInit } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';
import { User } from '../user/entities/user.entity';
import { Rol } from '../rol/entities/rol.entity';


@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([User, Rol]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
    }),
  ],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly authService: AuthService) {}

  async onModuleInit() {
    // Inicializar usuarios cuando el módulo esté listo
   // await this.authService.initializeUsers();
  }
}
