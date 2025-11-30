import { IsNotEmpty, IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DTO_MESSAGES } from 'src/common/resource/dto.messages';

export class CreateUserWithMessagesDto {
  @IsNotEmpty({ message: DTO_MESSAGES.VALIDATION.USERNAME_REQUIRED.message })
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  @MinLength(3, { message: DTO_MESSAGES.VALIDATION.USERNAME_TOO_SHORT.message })
  @MaxLength(50, { message: DTO_MESSAGES.VALIDATION.USERNAME_TOO_LONG.message })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: DTO_MESSAGES.VALIDATION.INVALID_USERNAME_FORMAT.message })
  @ApiProperty({ 
    description: 'Nombre de usuario',
    example: 'usuario123',
    minLength: 3,
    maxLength: 50
  })
  username: string;

  @IsNotEmpty({ message: DTO_MESSAGES.VALIDATION.EMAIL_REQUIRED.message })
  @IsEmail({}, { message: DTO_MESSAGES.VALIDATION.INVALID_EMAIL_FORMAT.message })
  @ApiProperty({ 
    description: 'Correo electrónico del usuario',
    example: 'usuario@ejemplo.com'
  })
  email: string;

  @IsNotEmpty({ message: DTO_MESSAGES.VALIDATION.PASSWORD_REQUIRED.message })
  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  @MinLength(8, { message: DTO_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT.message })
  @MaxLength(128, { message: DTO_MESSAGES.VALIDATION.PASSWORD_TOO_LONG.message })
  @ApiProperty({ 
    description: 'Contraseña del usuario',
    example: 'Contraseña123!',
    minLength: 8,
    maxLength: 128
  })
  password: string;

  @IsString({message: DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING.message})
  @ApiProperty({ 
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez'
  })
  fullName: string;
} 