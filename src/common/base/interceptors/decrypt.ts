// ✅ BACKEND (NESTJS) IMPLEMENTACIÓN COMPLETA CON VERSIONADO DE CLAVES
// ----------------------------------------------------------------------
// Instalar dependencias: npm install crypto-js

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Controller,
  Post,
  Body,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { Observable } from 'rxjs';

const LOCAL_SECRET = 'clave-local-constante';
const DEFAULT_KEY_VERSION = 'v1';
const KEY_DIR = path.join(__dirname, '../../keys');

function deriveHMACKey(token: string): string {
  return CryptoJS.PBKDF2(LOCAL_SECRET, token, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
}

function decryptAES(ciphertext: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function getPrivateKeyByVersion(version: string): string {
  const keyPath = path.join(KEY_DIR, `private_${version}.pem`);
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Clave privada no encontrada para versión ${version}`);
  }
  return fs.readFileSync(keyPath, 'utf8');
}

function decryptHybridPayload(payload: any, token: string): any {
  const { encryptedKey, ciphertext, signature, keyVersion, adjunto } = payload;
  const version = keyVersion || DEFAULT_KEY_VERSION;

  if (!encryptedKey || !ciphertext || !signature) {
    throw new Error('Faltan campos requeridos');
  }

  const privateKey = getPrivateKeyByVersion(version);

  // Desencriptar clave AES con clave privada RSA
  const aesKey = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(encryptedKey, 'base64')
  ).toString('utf8');

  // Verificar firma
  const hmacKey = deriveHMACKey(token);
  const expectedSignature = CryptoJS.HmacSHA256(ciphertext, hmacKey).toString();
  if (expectedSignature !== signature) {
    throw new Error('Firma no válida');
  }

  // Desencriptar datos con AES
  const decryptedJson = decryptAES(ciphertext, aesKey);
  const result = JSON.parse(decryptedJson);

  if (adjunto) result['adjunto'] = adjunto;
  return result;
}

@Injectable()
export class HybridDecryptInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException('Token no encontrado');

    try {
      req.body = decryptHybridPayload(req.body, token);
    } catch (err) {
      throw new UnauthorizedException('Error al desencriptar: ' + err.message);
    }

    return next.handle();
  }
}

// ✅ Controlador de ejemplo con endpoint para frontend
@Controller('secure')
@UseInterceptors(HybridDecryptInterceptor)
export class SecureController {
  @Post()
  handleSecure(@Body() body: any) {
    return {
      mensaje: 'Datos recibidos correctamente',
      data: body,
    };
  }

  @Get('key-version')
  getCurrentKeyVersion() {
    return {
      keyVersion: DEFAULT_KEY_VERSION,
    };
  }
}
