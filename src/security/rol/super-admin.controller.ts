import { Controller, Post, Get, Param, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SuperAdminSyncService } from './super-admin-sync.service';
import { CodeEnum } from 'src/common/enum/code.enum';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('super-admin')
@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminSyncService: SuperAdminSyncService) {}

  @UseGuards(JwtGuard)
  @Post('sync')
  @ApiOperation({ summary: 'Sincronizar rol Super Admin con todos los permisos' })
  @ApiResponse({ status: 200, description: 'Sincronización completada exitosamente' })
  @ApiResponse({ status: 500, description: 'Error durante la sincronización' })
  async syncSuperAdminRole(@GetUser() user: User) {
    try {
      const result = await this.superAdminSyncService.syncSuperAdminRole();
      if (result.isSuccess) {
        const data = result.data as any;
        return {
          success: true,
          message: `Sincronización completada. Roles`,
        
        };
      } else {
        throw new HttpException(
          result.errorMessage || 'Error durante la sincronización',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      throw new HttpException(
        `Error durante la sincronización: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }





} 