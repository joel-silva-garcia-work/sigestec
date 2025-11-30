export const AUTH_MESSAGES = {
  ERRORS: {
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    USER_NOT_FOUND: 'Usuario no encontrado',
    USER_ALREADY_EXISTS: 'El usuario ya existe',
    INVALID_TOKEN: 'Token inválido',
    TOKEN_EXPIRED: 'Token expirado',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso denegado',
    INVALID_REFRESH_TOKEN: 'Token de actualización inválido',
    PASSWORD_MISMATCH: 'Las contraseñas no coinciden',
    WEAK_PASSWORD: 'La contraseña es demasiado débil',
    EMAIL_ALREADY_EXISTS: 'El correo electrónico ya está registrado',
    ACCOUNT_LOCKED: 'Cuenta bloqueada',
    TOO_MANY_ATTEMPTS: 'Demasiados intentos de inicio de sesión',
    EXIST_ADMIN: 'Ya existe un administrador',
  },
  SUCCESS: {
    LOGIN_SUCCESS: 'Inicio de sesión exitoso',
    LOGOUT_SUCCESS: 'Cierre de sesión exitoso',
    REGISTRATION_SUCCESS: 'Registro exitoso',
    PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
    EMAIL_SENT: 'Correo de recuperación enviado',
    ACCOUNT_VERIFIED: 'Cuenta verificada exitosamente',
    TOKEN_REFRESHED: 'Token actualizado exitosamente',
  },
  VALIDATION: {
    EMAIL_REQUIRED: 'El correo electrónico es requerido',
    PASSWORD_REQUIRED: 'La contraseña es requerida',
    INVALID_EMAIL_FORMAT: 'Formato de correo electrónico inválido',
    PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
    PASSWORD_TOO_LONG: 'La contraseña no puede exceder 128 caracteres',
    USERNAME_REQUIRED: 'El nombre de usuario es requerido',
    USERNAME_TOO_SHORT: 'El nombre de usuario debe tener al menos 3 caracteres',
    USERNAME_TOO_LONG: 'El nombre de usuario no puede exceder 50 caracteres',
    INVALID_USERNAME_FORMAT: 'El nombre de usuario solo puede contener letras, números y guiones',
  },
  INFO: {
    SESSION_EXPIRED: 'Su sesión ha expirado',
    PLEASE_LOGIN: 'Por favor inicie sesión',
    ACCOUNT_CREATED: 'Su cuenta ha sido creada',
    VERIFICATION_EMAIL_SENT: 'Se ha enviado un correo de verificación',
    PASSWORD_RESET_EMAIL_SENT: 'Se ha enviado un correo para restablecer la contraseña',
  },
} as const;

export type AuthMessageKey = 
  | keyof typeof AUTH_MESSAGES.ERRORS 
  | keyof typeof AUTH_MESSAGES.SUCCESS 
  | keyof typeof AUTH_MESSAGES.VALIDATION
  | keyof typeof AUTH_MESSAGES.INFO; 