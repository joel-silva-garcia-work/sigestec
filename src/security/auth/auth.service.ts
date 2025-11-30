import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { AuthDto } from './dto/auth.dto';
import { TokenDto } from './dto/token.dto';
import { LogOutDto } from './dto/logOut.dto';
import { LoginDto } from './dto/login.dto';
import { Rol } from '../rol/entities/rol.entity';
import { CreateUserDto } from '../user/dto';
import * as ldap from 'ldapjs';
import { ReturnDto } from 'src/common/base/dto/return.dto';
import { CodeEnum } from 'src/common/enum/code.enum';
import { AUTH_MESSAGES } from 'src/common/resource/auth.messages';

@Injectable({})
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SUPER_ADMIN_NAME = 'Super Admin';

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Rol)
    private roleRepository: Repository<Rol>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<ReturnDto> {
    this.logger.log(`Iniciando autenticación para usuario: ${dto.username}`);
    const returnDto = new ReturnDto();
    try {
      // Buscar usuario por username
      const user = await this.userRepository.findOneBy({
        username: dto.username,
      });

      if (!user) {
        returnDto.isSuccess = false;
        returnDto.returnCode = CodeEnum.FORBIDDEN;
        returnDto.errorMessage = AUTH_MESSAGES.ERRORS.USER_NOT_FOUND;
        return returnDto;
      }

      // Verificar contraseña
      const pwMatch = await argon.verify(user.hash, dto.password);
      if (!pwMatch) {
        returnDto.isSuccess = false;
        returnDto.returnCode = CodeEnum.FORBIDDEN;
        returnDto.errorMessage = AUTH_MESSAGES.ERRORS.INVALID_CREDENTIALS;
        return returnDto;
      }

      // Generar token JWT
      const refresh_token = await this.signToken(user.id.toString(), user.username, '3m');

      this.logger.log(`Usuario ${dto.username} autenticado exitosamente`);

      returnDto.isSuccess = true;
      returnDto.returnCode = CodeEnum.OK;
      returnDto.data = {
        name: user.name,
        username: user.username,
        refresh_token: refresh_token,
        auth_method: 'LOCAL'
      };
      return returnDto;

    } catch (error) {
      this.logger.error(`Error en autenticación para ${dto.username}:`, error.message);
      returnDto.isSuccess = false;
      returnDto.returnCode = CodeEnum.FORBIDDEN;
      returnDto.errorMessage = 'Error interno de autenticación';
      return returnDto;
    }
  }

  async logOut(dto: LoginDto) {
    // find the user by username
    const user = await this.userRepository.findOneBy({
      username: dto.username,
    });

    if (!user) {
      throw new ForbiddenException('User Name do not exist');
    }
    // return true (no isLogged field)
    return true;
  }

  async signToken(
    userId: string,
    username: string,
    expiresIn: string,
  ): Promise<string> {
    const payload = {
      sub: userId,
      username,
    };
    const secret = this.config.get('JWT_SECRET_KEY');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: expiresIn,
      secret: secret,
    });

    return token;
  }

  async isTokenExpired(dto: TokenDto): Promise<any> {
    const token = dto.token;
    try {
      const secret = this.config.get('JWT_SECRET_KEY');
      await this.jwt.verifyAsync(token, {
        secret: secret,
        ignoreExpiration: true // Verify everything except expiration
      });
      try {
        // Now check expiration
        await this.jwt.verifyAsync(token, {
          secret: secret
        });
        return false; // Token is valid and not expired
      } catch (expError) {
        if (expError.name === 'TokenExpiredError') {
          // Get user info from expired token
          const decodedToken = this.jwt.decode(token);
          if (decodedToken && typeof decodedToken === 'object') {
            // Generate new token with same user info
            const newToken = await this.signToken(
              decodedToken.sub,
              decodedToken.username,
              '1m'
            );
            return newToken;
          }
        }
        return false; // Other verification error
      }

    } catch (error) {
      return false; // Invalid token
    }
  }

  async loggedOut(dto: LogOutDto): Promise<any> {
    // find the user by id
    const user = await this.userRepository.findOneBy({
      id: dto.id,
    });

    if (!user) {
      throw new ForbiddenException('User Name do not exist');
    }
    // return true (no isLogged field)
    return true;
  }


}
