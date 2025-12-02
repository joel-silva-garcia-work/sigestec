import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RoleSyncService } from '../src/security/rol/role-sync.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('SuperAdminScript');
  
  try {
    logger.log('🚀 Iniciando script de creación del roles...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const superAdminSyncService = app.get(RoleSyncService);
    
    
    const result = await superAdminSyncService.syncSuperAdminRole();
    
    if (result.isSuccess) {
      const data = result.data as any;
      logger.log('✅ Script completado exitosamente!');
    } else {
      logger.error(`❌ Error durante la ejecución: ${result.errorMessage}`);
      process.exit(1);
    }
    
    await app.close();
    logger.log('🏁 Script finalizado');
    
  } catch (error) {
    logger.error('❌ Error crítico durante la ejecución del script:', error);
    process.exit(1);
  }
}

bootstrap(); 