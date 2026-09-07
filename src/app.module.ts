import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createObserveModule } from '@nestjs/observe';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/users.module';
import { ClientesModule } from './clientes/clientes.module';
import { PlanesModule } from './planes/planes.module';

// Entidades de la base de datos
import { UserEntity } from './usuarios/infrastructure/entities/user.entity';
import { RolEntity } from './usuarios/infrastructure/entities/rol.entity';
import { CommonModule } from './common/infrastructure/common.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Telemetría / Observe
    // ObserveModule.forRoot({
    //   appKey: 'YOUR_APP_KEY',
    //   appSecret: 'YOUR_APP_SECRET',
    //   serviceId: 'helpdesk-backend',
    // }),

    // Configuración de la Base de Datos
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'helpdesk_db',
      entities: [
        UserEntity,
        RolEntity, // Agrega aquí tus entidades TypeORM
      ],
      synchronize: false, // Cambiar a false en producción
    }),
    // Módulo común que contiene filtros e interceptores globales
    CommonModule,

    // Módulos de la aplicación
    AuthModule,
    UsuariosModule,
    ClientesModule,
    PlanesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
