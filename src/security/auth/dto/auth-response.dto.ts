import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ description: 'Nombre completo del usuario' })
  name: string;

  @ApiProperty({ description: 'Nombre de usuario' })
  username: string;

  @ApiProperty({ description: 'Email del usuario' })
  email: string;

  @ApiProperty({ description: 'Token JWT de autenticación' })
  refresh_token: string;

  @ApiProperty({ 
    description: 'Método de autenticación usado', 
    enum: ['LDAP', 'LOCAL'],
    example: 'LDAP'
  })
  auth_method: 'LDAP' | 'LOCAL';
} 