import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
  // UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import { GetUser, GetUserAdmin } from './decorator';
import { TokenDto } from './dto/token.dto';
import { LogOutDto } from './dto/logOut.dto';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from './guard';
import { CreateUserDto } from '../user/dto';
import { User } from '../user/entities/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
// import { GetUserAdmin } from './decorator';
// import { JwtGuard } from './guard';
// import { User } from '../user/entities/user.entity';

@ApiTags('Authentication')
@Controller('autenticacion')
export class AuthController {
  constructor(private authSetvice: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('autenticarse')
  @ApiOperation({ 
    summary: 'Autentica el usuario',
    description: 'Autentica el usuario contra LDAP primero, si falla usa autenticación local como fallback'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Autenticación exitosa',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Credenciales inválidas o usuario ya logueado' 
  })
  signin(@Body() dto: AuthDto): Promise<any> {
    return this.authSetvice.login(dto);
  }

  
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('salir')
  @ApiOperation({ summary: 'Cierra sesión' })
  signOut(@GetUser() user: User) {
    const dto = new LoginDto
    dto.username = user.username
    return this.authSetvice.logOut(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('esta-token-expirado')
  @ApiOperation({ summary: 'Valida el token' })
  isTokenExpired(@Body() dto: TokenDto) {
    return this.authSetvice.isTokenExpired(dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('cierra-sesion')
  @ApiOperation({ summary: 'Cierra sesión' })
  loggedAdmin(
  @Body() dto: LogOutDto,
  @GetUserAdmin() user: User) {
    return this.authSetvice.loggedOut(dto);
  }
}
