export const MAIL_MESSAGES = {
  ERRORS: {
    SEND_FAILED: 'No se pudo enviar el correo',
    INVALID_CONFIGURATION: 'Configuración de correo inválida',
    CONNECTION_FAILED: 'No se pudo conectar al servidor de correo',
    AUTHENTICATION_FAILED: 'Error de autenticación en el servidor de correo',
  },
  SUCCESS: {
    EMAIL_SENT: 'Correo enviado exitosamente',
  },
  VALIDATION: {
    INVALID_EMAIL: 'Dirección de correo electrónico inválida',
    MISSING_RECIPIENT: 'Destinatario requerido',
    MISSING_SUBJECT: 'Asunto requerido',
    MISSING_CONTENT: 'Contenido del correo requerido',
  },
} as const;

export type MailMessageKey = keyof typeof MAIL_MESSAGES.ERRORS | keyof typeof MAIL_MESSAGES.SUCCESS | keyof typeof MAIL_MESSAGES.VALIDATION; 