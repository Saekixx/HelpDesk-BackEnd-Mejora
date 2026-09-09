// En src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS para permitir solicitudes desde cualquier origen
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Activamos la validación y transformación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si envían propiedades extra
      transform: true, // Transforma cargas útiles a instancias de DTO
      transformOptions: {
        enableImplicitConversion: true, // Convierte tipos primitivos en Query Params (string a boolean/number)
      },
    }),
  );

  // Configuración de OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('Help-Desk API System Documentation')
    .setDescription(
      'Especificación completa de endpoints para los módulos del sistema',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa tu JWT Token',
        in: 'header',
      },
      'access-token', // Identificador del esquema de seguridad
    )
    // Agregamos etiquetas para organizar los endpoints en Swagger UI
    .addTag(
      'Autenticación',
      'Endpoints para login, registro y renovación de tokens',
    )
    .addTag('Usuarios', 'Gestión, asignación de roles y perfilado de usuarios')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Ruta donde se desplegará la interfaz interactiva
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Mantiene el token JWT cargado tras refrescar
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
