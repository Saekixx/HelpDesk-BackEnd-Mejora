// En src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activamos la validación automática de DTOs en toda la API
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Eliminamos propiedades no permitidas en el DTO
      forbidNonWhitelisted: true, // Arrojamos error si envían propiedades extra
      transform: true, // Transformamos automáticamente los tipos recibidos
    }),
  );

  await app.listen(3000);
}
bootstrap();
