import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RoleSyncService } from './role-sync.service';
 
@Injectable()
export class SuperAdminInitService implements OnModuleInit {
  private readonly logger = new Logger(SuperAdminInitService.name);

  constructor(private readonly rolSyncService: RoleSyncService) {}

  async onModuleInit() {
    this.logger.log('Inicializando sincronización automática del Super Admin...');
    
    try {
      const result = await this.rolSyncService.syncSuperAdminRole();
      
      if (result.isSuccess) {
        this.logger.log(`OK`);
      } else {
        this.logger.error(`❌ Error durante la sincronización automática: ${result.errorMessage}`);
      }
    } catch (error) {
      this.logger.error('❌ Error crítico durante la inicialización del Super Admin:', error);
    }
  }
} 