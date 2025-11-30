export const DTO_MESSAGES = {
  VALIDATION: {
    // Mensajes base para validaciones generales
    FIELD_MUST_BE_STRING: { key: 'FIELD_MUST_BE_STRING', message: 'El campo debe ser una cadena' },
    FIELD_CANNOT_BE_EMPTY: { key: 'FIELD_CANNOT_BE_EMPTY', message: 'El campo no puede estar vacío' },
    FIELD_MAX_LENGTH: { key: 'FIELD_MAX_LENGTH', message: 'El campo no puede exceder los 100 caracteres' },
    FIELD_MAX_LENGTH_255: { key: 'FIELD_MAX_LENGTH_255', message: 'El campo no puede exceder los 255 caracteres' },
    FIELD_MIN_LENGTH: { key: 'FIELD_MIN_LENGTH', message: 'El nombre no puede ser inferior a los 2 caracteres' },
    FIELD_MUST_BE_BOOLEAN: { key: 'FIELD_MUST_BE_BOOLEAN', message: 'El campo debe ser booleano' },
    FIELD_MUST_BE_NUMBER: { key: 'FIELD_MUST_BE_NUMBER', message: 'El campo debe ser un número' },
    FIELD_MUST_BE_DATE: { key: 'FIELD_MUST_BE_DATE', message: 'El campo debe ser una fecha válida' },
    FIELD_MUST_BE_UUID: { key: 'FIELD_MUST_BE_UUID', message: 'El campo debe ser un UUID válido' },
    FIELD_MUST_BE_EMAIL: { key: 'FIELD_MUST_BE_EMAIL', message: 'El campo debe ser un correo electrónico válido' },
    FIELD_MUST_BE_PHONE: { key: 'FIELD_MUST_BE_PHONE', message: 'El campo debe ser un número de teléfono válido' },
    FIELD_MUST_BE_STRONG_PASSWORD: { key: 'FIELD_MUST_BE_STRONG_PASSWORD', message: 'La contraseña debe cumplir con los requisitos de seguridad' },
    FIELD_MUST_BE_TIME: { key: 'FIELD_MUST_BE_TIME', message: 'El campo debe ser una hora válida' },
    FIELD_MUST_BE_ENUM: { key: 'FIELD_MUST_BE_ENUM', message: 'El campo debe ser un valor válido del enumerado' },
    FIELD_MUST_BE_ARRAY: { key: 'FIELD_MUST_BE_ARRAY', message: 'El campo debe ser un arreglo' },
    
    // Mensajes específicos de autenticación
    EMAIL_REQUIRED: { key: 'EMAIL_REQUIRED', message: 'El correo electrónico es requerido' },
    PASSWORD_REQUIRED: { key: 'PASSWORD_REQUIRED', message: 'La contraseña es requerida' },
    INVALID_EMAIL_FORMAT: { key: 'INVALID_EMAIL_FORMAT', message: 'Formato de correo electrónico inválido' },
    PASSWORD_TOO_SHORT: { key: 'PASSWORD_TOO_SHORT', message: 'La contraseña debe tener al menos 8 caracteres' },
    PASSWORD_TOO_LONG: { key: 'PASSWORD_TOO_LONG', message: 'La contraseña no puede exceder 128 caracteres' },
    USERNAME_REQUIRED: { key: 'USERNAME_REQUIRED', message: 'El nombre de usuario es requerido' },
    USERNAME_TOO_SHORT: { key: 'USERNAME_TOO_SHORT', message: 'El nombre de usuario debe tener al menos 3 caracteres' },
    USERNAME_TOO_LONG: { key: 'USERNAME_TOO_LONG', message: 'El nombre de usuario no puede exceder 50 caracteres' },
    INVALID_USERNAME_FORMAT: { key: 'INVALID_USERNAME_FORMAT', message: 'El nombre de usuario solo puede contener letras, números y guiones' },
  },
} as const;

export type DtoMessageKey = 
  | keyof typeof DTO_MESSAGES.VALIDATION