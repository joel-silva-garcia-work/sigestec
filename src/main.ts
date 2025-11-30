import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ClearWhiteSpaceInterceptor } from './common/base/interceptors/white-space.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import Debugger from 'debug'
import { json, urlencoded } from 'body-parser';


const debug = Debugger('sigedoc:main')


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Validators
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  // Interceptors
  app.useGlobalInterceptors(new ClearWhiteSpaceInterceptor());

  // Allow calls
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: '*',    
  });

  // Swagger
  const options = new DocumentBuilder()
    .setTitle('SIGEDOC')
    .setDescription('SIGEDOC API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

    // Configurar el tamaño máximo del cuerpo de la solicitud
    app.use(json({ limit: '20mb' })); // Ajusta el límite según tus necesidades
    app.use(urlencoded({ limit: '20mb', extended: true }));
  
  // Global location of DNS/v1/ Rest URL
  app.setGlobalPrefix('v1') 
  app.set('trust proxy', true); // Habilitar trust proxy
  
  // iniciando puerto 5005 para dejar free el 3000 para frontend
  await app.listen(process.env.API_PORT);
 }
bootstrap();
