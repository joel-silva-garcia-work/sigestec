import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ 
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({ 
    description: 'Nombre de usuario',
    example: 'usuario123'
  })
  username: string;

  @ApiProperty({ 
    description: 'Correo electrónico del usuario',
    example: 'usuario@ejemplo.com'
  })
  email: string;

  @ApiProperty({ 
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez'
  })
  fullName: string;

  @ApiProperty({ 
    description: 'Indica si el usuario está activo',
    example: true
  })
  isActive: boolean;

  @ApiProperty({ 
    description: 'Fecha de creación del usuario',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;
} 