import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para la API REST
  app.setGlobalPrefix('api');

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuración de CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configuración de Documentación Swagger (OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('ProFuncional API')
    .setDescription(
      'API REST transaccional para la gestión kinésico-deportiva de ProFuncional (Agendamiento, Fichas SOAP, Saldo de Paquetes y Métricas)',
    )
    .setVersion('1.0.0 (Sprint 1)')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 ProFuncional Backend corriendo en: http://localhost:${port}/api`);
  console.log(`📑 Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
}
bootstrap();
