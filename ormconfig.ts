import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Rol } from 'src/security/rol/entities/rol.entity';
import { Traza } from 'src/security/trazas/entities/traza.entity';

//import
import { Departamentos } from './src/comun/departamentos/entities/departamentos.entity';
import { Aft } from './src/comun/aft/entities/aft.entity';
import { Ordenes } from './src/taller/ordenes/entities/ordenes.entity';
import { Solicitudes } from './src/taller/solicitudes/entities/solicitudes.entity';
import { Equipos } from './src/comun/equipos/entities/equipos.entity';
import { Configuration } from './src/config/configuration/entities/configuration.entity';
import { User } from './src/security/user/entities/user.entity';
import { Notification } from './src/notify/notifications/entities/notification.entity';

dotenv.config(); // Carga las variables de entorno desde el archivo .env

export const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // entities: ['src/**/entities/*.entity.ts'],

  entities: [
    Traza,
    Rol,
    //////------- New tables
    Departamentos,
    Aft,
    Ordenes,
    Solicitudes,
    Equipos,
    Configuration,
    User,
    Notification,

  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: true,
};

export default config;
