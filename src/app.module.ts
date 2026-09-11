import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';

import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/users.module';
import { ClientesModule } from './clientes/clientes.module';
import { PlanesModule } from './planes/planes.module';
import { CommonModule } from './common/common.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Variables de entorno disponibles globalmente
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // CommonModule se encarga de proveer PrismaService y otros servicios globales
    CommonModule,

    // Módulos de la aplicación
    AuthModule,
    UsuariosModule,
    ClientesModule,
    PlanesModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
