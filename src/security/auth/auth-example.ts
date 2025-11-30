/**
 * Ejemplo de uso de la autenticación integrada con LDAP
 * 
 * Este ejemplo muestra cómo funciona la nueva autenticación que:
 * 1. Intenta autenticar contra LDAP primero
 * 2. Si LDAP falla, usa autenticación local como fallback
 * 3. Crea usuarios automáticamente desde LDAP si no existen
 */

import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthExample {
  private readonly logger = new Logger(AuthExample.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Ejemplo de autenticación con usuario LDAP
   */
  async ejemploAutenticacionLdap() {
    try {
      this.logger.log('=== Ejemplo: Autenticación LDAP ===');

      // Credenciales de un usuario que existe en LDAP
      const loginDto = new LoginDto();
      loginDto.username = 'john.doe';
      loginDto.password = 'password123';

      this.logger.log(`Intentando autenticar usuario: ${loginDto.username}`);

      const result = await this.authService.login(loginDto);

      if (result.isSuccess) {
        const data = result.data as { name: string; username: string; auth_method: string; refresh_token: string };
        this.logger.log('✅ Autenticación exitosa:');
        this.logger.log(`   - Nombre: ${data.name}`);
        this.logger.log(`   - Usuario: ${data.username}`);
        this.logger.log(`   - Método: ${data.auth_method}`);
        this.logger.log(`   - Token: ${data.refresh_token.substring(0, 20)}...`);
      } else {
        this.logger.error('❌ Error en autenticación LDAP:', result.errorMessage);
      }

      return result;

    } catch (error) {
      this.logger.error('❌ Error en autenticación LDAP:', error.message);
      throw error;
    }
  }

  /**
   * Ejemplo de autenticación local (fallback)
   */
  async ejemploAutenticacionLocal() {
    try {
      this.logger.log('\n=== Ejemplo: Autenticación Local (Fallback) ===');

      // Credenciales de un usuario local
      const loginDto = new LoginDto();
      loginDto.username = 'admin';
      loginDto.password = 'Admin123!@#';

      this.logger.log(`Intentando autenticar usuario local: ${loginDto.username}`);

      const result = await this.authService.login(loginDto);

      if (result.isSuccess) {
        const data = result.data as { name: string; username: string; auth_method: string; refresh_token: string };
        this.logger.log('✅ Autenticación local exitosa:');
        this.logger.log(`   - Nombre: ${data.name}`);
        this.logger.log(`   - Usuario: ${data.username}`);
        this.logger.log(`   - Método: ${data.auth_method}`);
        this.logger.log(`   - Token: ${data.refresh_token.substring(0, 20)}...`);
      } else {
        this.logger.error('❌ Error en autenticación local:', result.errorMessage);
      }

      return result;

    } catch (error) {
      this.logger.error('❌ Error en autenticación local:', error.message);
      throw error;
    }
  }

  /**
   * Ejemplo de autenticación con usuario inexistente
   */
  async ejemploUsuarioInexistente() {
    try {
      this.logger.log('\n=== Ejemplo: Usuario Inexistente ===');

      // Credenciales de un usuario que no existe
      const loginDto = new LoginDto();
      loginDto.username = 'usuario.inexistente';
      loginDto.password = 'password123';

      this.logger.log(`Intentando autenticar usuario inexistente: ${loginDto.username}`);

      const result = await this.authService.login(loginDto);

      if (!result.isSuccess) {
        this.logger.log('✅ Correcto: Se rechazó el usuario inexistente');
        this.logger.log(`   - Error: ${result.errorMessage}`);
      } else {
        this.logger.log('❌ Error: Se autenticó un usuario inexistente');
      }

    } catch (error) {
      this.logger.log('✅ Correcto: Se rechazó el usuario inexistente');
      this.logger.log(`   - Error: ${error.message}`);
    }
  }

  /**
   * Ejemplo de autenticación con credenciales incorrectas
   */
  async ejemploCredencialesIncorrectas() {
    try {
      this.logger.log('\n=== Ejemplo: Credenciales Incorrectas ===');

      // Usuario válido pero contraseña incorrecta
      const loginDto = new LoginDto();
      loginDto.username = 'john.doe';
      loginDto.password = 'contraseña_incorrecta';

      this.logger.log(`Intentando autenticar con contraseña incorrecta: ${loginDto.username}`);

      const result = await this.authService.login(loginDto);

      if (!result.isSuccess) {
        this.logger.log('✅ Correcto: Se rechazaron las credenciales incorrectas');
        this.logger.log(`   - Error: ${result.errorMessage}`);
      } else {
        this.logger.log('❌ Error: Se autenticó con credenciales incorrectas');
      }

    } catch (error) {
      this.logger.log('✅ Correcto: Se rechazaron las credenciales incorrectas');
      this.logger.log(`   - Error: ${error.message}`);
    }
  }

  /**
   * Ejemplo de autenticación con usuario ya logueado
   */
  async ejemploUsuarioYaLogueado() {
    try {
      this.logger.log('\n=== Ejemplo: Usuario Ya Logueado ===');

      // Primero autenticar al usuario
      const loginDto1 = new LoginDto();
      loginDto1.username = 'john.doe';
      loginDto1.password = 'password123';

      this.logger.log('Primera autenticación...');
      const result1 = await this.authService.login(loginDto1);
      if (result1.isSuccess) {
        this.logger.log('✅ Primera autenticación exitosa');
      } else {
        this.logger.error('❌ Error en primera autenticación:', result1.errorMessage);
        return;
      }

      // Intentar autenticar el mismo usuario nuevamente
      this.logger.log('Intentando segunda autenticación...');
      const result2 = await this.authService.login(loginDto1);

      if (!result2.isSuccess) {
        this.logger.log('✅ Correcto: Se rechazó la segunda autenticación');
        this.logger.log(`   - Error: ${result2.errorMessage}`);
      } else {
        this.logger.log('❌ Error: Se autenticó un usuario ya logueado');
      }

    } catch (error) {
      this.logger.log('✅ Correcto: Se rechazó la segunda autenticación');
      this.logger.log(`   - Error: ${error.message}`);
    }
  }

  /**
   * Ejemplo completo de flujo de autenticación
   */
  async ejemploCompleto() {
    try {
      this.logger.log('=== EJEMPLO COMPLETO DE AUTENTICACIÓN INTEGRADA ===');

      // Caso 1: Usuario LDAP válido
      await this.ejemploAutenticacionLdap();

      // Caso 2: Usuario local válido (cuando LDAP no está disponible)
      await this.ejemploAutenticacionLocal();

      // Caso 3: Usuario inexistente
      await this.ejemploUsuarioInexistente();

      // Caso 4: Credenciales incorrectas
      await this.ejemploCredencialesIncorrectas();

      // Caso 5: Usuario ya logueado
      await this.ejemploUsuarioYaLogueado();

      this.logger.log('\n=== TODOS LOS EJEMPLOS COMPLETADOS ===');

    } catch (error) {
      this.logger.error('❌ Error en ejemplo completo:', error.message);
    }
  }

  /**
   * Ejemplo de uso en producción
   */
  async ejemploProduccion() {
    try {
      this.logger.log('=== Ejemplo: Uso en Producción ===');

      // Simular diferentes escenarios de autenticación
      const usuarios = [
        { username: 'john.doe', password: 'password123', desc: 'Usuario LDAP' },
        { username: 'admin', password: 'Admin123!@#', desc: 'Usuario Local' },
        { username: 'jane.smith', password: 'password456', desc: 'Usuario LDAP Nuevo' }
      ];

      for (const usuario of usuarios) {
        try {
          this.logger.log(`\n--- Autenticando: ${usuario.desc} ---`);
          
          const loginDto = new LoginDto();
          loginDto.username = usuario.username;
          loginDto.password = usuario.password;

          const result = await this.authService.login(loginDto);
          
          if (result.isSuccess) {
            const data = result.data as { name: string; username: string; auth_method: string; refresh_token: string };
            this.logger.log(`✅ ${usuario.desc} autenticado exitosamente`);
            this.logger.log(`   - Método: ${data.auth_method}`);
            this.logger.log(`   - Token generado: ${data.refresh_token ? 'Sí' : 'No'}`);
          } else {
            this.logger.error(`❌ Error autenticando ${usuario.desc}: ${result.errorMessage}`);
          }

        } catch (error) {
          this.logger.error(`❌ Error autenticando ${usuario.desc}: ${error.message}`);
        }
      }

    } catch (error) {
      this.logger.error('❌ Error en ejemplo de producción:', error.message);
    }
  }
} 