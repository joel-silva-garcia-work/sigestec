import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';
import { ReturnDto } from '../../common/base/dto/return.dto';
import { CodeEnum } from '../../common/enum/code.enum';

@Injectable()
export class RoleSyncService {
  private readonly logger = new Logger(RoleSyncService.name);
  private readonly SUPER_ADMIN_NAME = 'Super Admin';
  private readonly SUPER_ADMIN_DESCRIPTION = 'Rol con acceso completo a todas las funcionalidades del sistema';

  private readonly JEFE_TALLER = 'Jefe Taller';
  private readonly JEFE_TALLER_DESCRIPTION = 'Rol con acceso a todas las funcionalidades del jefe de taller del sistema'; 

  private readonly TECNICO = 'Técnico Taller';
  private readonly TECNICO_DESCRIPTION = 'Rol con acceso a todas las funcionalidades del técnico de Taller del sistema'; 

  private readonly USUARIO_SISTEMA = 'Usuario Sistema';
  private readonly USUARIO_SISTEMA_DESCRIPTION = 'Rol con acceso a todas las funcionalidades del solicitante de servicios técnicos del sistema'; 

  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  /**
   * Sincronizar el rol Super Admin con todos los permisos existentes
   */
  async syncSuperAdminRole(): Promise<ReturnDto> {
    const result = new ReturnDto();
    
    try {
      this.logger.log('Iniciando creacion de Roles...');

      // 1. Obtener o crear el rol Super Admin
      const superAdminRole = await this.findOrCreateSuperAdminRole();

      // 2. Obtener o crear el rol Jefe de Taller
      const jefeTallerRole = await this.findOrCreateJefeTallerRole();

      // 3. Obtener o crear el rol Usuario
      const usuarioRole = await this.findOrCreateUsuarioGeneralRole();
    
      result.isSuccess = true;
      result.returnCode = CodeEnum.OK;

      

    } catch (error) {
      this.logger.error('Error durante la sincronización del Super Admin:', error);
      result.isSuccess = false;
      result.returnCode = CodeEnum.INTERNAL_ERROR;
      result.errorMessage = `Error durante la sincronización: ${error.message}`;
    }

    return result;
  }

  /**
   * Buscar o crear el rol Super Admin
   */
  private async findOrCreateSuperAdminRole(): Promise<Rol> {
    let superAdminRole = await this.rolRepository.findOne({
      where: { name: this.SUPER_ADMIN_NAME }
    });

    if (!superAdminRole) {
      this.logger.log('Creando rol Super Admin...');
      superAdminRole = this.rolRepository.create({
        name: this.SUPER_ADMIN_NAME,
        description: this.SUPER_ADMIN_DESCRIPTION
      });
      superAdminRole = await this.rolRepository.save(superAdminRole);
      this.logger.log(`Rol Super Admin creado con ID: ${superAdminRole.id}`);
    } else {
      this.logger.log(`Rol Super Admin encontrado con ID: ${superAdminRole.id}`);
    }

    return superAdminRole;
  }

  /**
   * Buscar o crear el rol Jefe de Taller
   */
  private async findOrCreateJefeTallerRole(): Promise<Rol> {
    let superAdminRole = await this.rolRepository.findOne({
      where: { name: this.JEFE_TALLER }
    });

    if (!superAdminRole) {
      this.logger.log('Creando rol Super Admin...');
      superAdminRole = this.rolRepository.create({
        name: this.JEFE_TALLER,
        description: this.JEFE_TALLER_DESCRIPTION
      });
      superAdminRole = await this.rolRepository.save(superAdminRole);
      this.logger.log(`Rol creado con ID: ${superAdminRole.id}`);
    } else {
      this.logger.log(`Rol encontrado con ID: ${superAdminRole.id}`);
    }

    return superAdminRole;
  }
    /**
   * Buscar o crear el rol Tecnico de Taller
   */
    private async findOrCreateTecnicoRole(): Promise<Rol> {
      let superAdminRole = await this.rolRepository.findOne({
        where: { name: this.TECNICO }
      });
  
      if (!superAdminRole) {
        this.logger.log('Creando rol Super Admin...');
        superAdminRole = this.rolRepository.create({
          name: this.TECNICO,
          description: this.TECNICO_DESCRIPTION
        });
        superAdminRole = await this.rolRepository.save(superAdminRole);
        this.logger.log(`Rol creado con ID: ${superAdminRole.id}`);
      } else {
        this.logger.log(`Rol encontrado con ID: ${superAdminRole.id}`);
      }
  
      return superAdminRole;
    }


    /**
   * Buscar o crear el rol Tecnico de Taller
   */
    private async findOrCreateUsuarioGeneralRole(): Promise<Rol> {
      let superAdminRole = await this.rolRepository.findOne({
        where: { name: this.USUARIO_SISTEMA }
      });
  
      if (!superAdminRole) {
        this.logger.log('Creando rol Super Admin...');
        superAdminRole = this.rolRepository.create({
          name: this.USUARIO_SISTEMA,
          description: this.USUARIO_SISTEMA_DESCRIPTION
        });
        superAdminRole = await this.rolRepository.save(superAdminRole);
        this.logger.log(`Rol creado con ID: ${superAdminRole.id}`);
      } else {
        this.logger.log(`Rol encontrado con ID: ${superAdminRole.id}`);
      }
  
      return superAdminRole;
    }
} 