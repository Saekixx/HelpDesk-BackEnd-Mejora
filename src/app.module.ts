import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';

import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/users.module';
import { ClientesModule } from './clientes/clientes.module';
import { PlanesModule } from './planes/planes.module';
import { CommonModule } from './common/common.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Telemetría / Observe
    // ObserveModule.forRoot({
    //   appKey: 'YOUR_APP_KEY',
    //   appSecret: 'YOUR_APP_SECRET',
    //   serviceId: 'helpdesk-backend',
    // }),

    // CommonModule se encarga de proveer PrismaService y otros servicios globales
    CommonModule,

    // Módulos de la aplicación
    AuthModule,
    UsuariosModule,
    ClientesModule,
    PlanesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
