import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SuperAdminSyncService } from './super-admin-sync.service';

@Injectable()
export class SuperAdminInitService implements OnModuleInit {
  private readonly logger = new Logger(SuperAdminInitService.name);

  constructor(private readonly superAdminSyncService: SuperAdminSyncService) {}

  async onModuleInit() {
    this.logger.log('Inicializando sincronización automática del Super Admin...');
    
    try {
      const result = await this.superAdminSyncService.syncSuperAdminRole();
      
      if (result.isSuccess) {
        const data = result.data as any;
        this.logger.log(`✅ Sincronización automática completada. Super Admin tiene ${data.totalPermissions} permisos`);
        
        if (data.addedPermissions > 0) {
          this.logger.log(`📝 Se agregaron ${data.addedPermissions} permisos nuevos al Super Admin`);
        }
        
        if (data.removedPermissions > 0) {
          this.logger.log(`🗑️ Se deshabilitaron ${data.removedPermissions} permisos obsoletos`);
        }
      } else {
        this.logger.error(`❌ Error durante la sincronización automática: ${result.errorMessage}`);
      }
    } catch (error) {
      this.logger.error('❌ Error crítico durante la inicialización del Super Admin:', error);
    }
  }
} 