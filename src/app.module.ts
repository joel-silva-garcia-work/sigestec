import { Module, forwardRef } from '@nestjs/common';
import { DepartamentosModule } from './comun/departamentos/departamentos.module';
import { AftModule } from './comun/aft/aft.module';
import { OrdenesModule } from './taller/ordenes/ordenes.module';
import { SolicitudesModule } from './taller/solicitudes/solicitudes.module';
import { EquiposModule } from './comun/equipos/equipos.module';
import { ConfigurationModule } from './config/configuration/configuration.module';
import { UserModule } from './security/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { config } from '../ormconfig';
import { JwtModule } from '@nestjs/jwt';
import { TrazasModule } from './security/trazas/trazas.module';
import { RolModule } from './security/rol/rol.module';
import { AuthModule } from './security/auth/auth.module';
import { NotificationsModule } from './notify/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRoot(config),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
    }),
    TrazasModule,
    RolModule,
    UserModule,
    AuthModule,  
    ConfigurationModule,
    NotificationsModule,
    EquiposModule,
    SolicitudesModule,
    OrdenesModule,
    AftModule,
    DepartamentosModule,
  ],
  controllers: [],
  providers: [],
  exports: [], // Exporta el servicio para ser utilizado en otros módulos
})
export class AppModule {}
