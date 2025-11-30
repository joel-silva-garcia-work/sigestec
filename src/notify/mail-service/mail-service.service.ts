   // src/mail/mail.service.ts
   import { Injectable } from '@nestjs/common';
   import { createTransport } from 'nodemailer';
   import * as dotenv from 'dotenv';

   @Injectable()
   export class MailService {
     private transporter;

     constructor() {
       this.transporter = createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "d7c7cb37690432",
          pass: "****e7e4"
        }
        //  service: 'gmail', // Cambia esto por el servicio que estés utilizando
        //  auth: {
        //    user: process.env.MAIL_USER, // Tu correo
        //    pass: process.env.MAIL_PASS, // Tu contraseña
        //  },
       });
     }
     
     async sendEmail(from: string, to: string, subject: string, html: string) {
      try {
        await this.transporter.sendMail({from, to, subject, html });
        console.log('Email enviado exitosamente'); // Mensaje de éxito
      } catch (error) {
        console.error('Error al enviar el correo:', error); // Manejo de errores
        throw new Error('No se pudo enviar el correo'); // Lanzar error
      }
    }
   }