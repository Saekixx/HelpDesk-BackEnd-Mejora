import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/users.module';
import { ClientesModule } from './clientes/clientes.module';
import { PlanesModule } from './planes/planes.module';
import { EquiposModule } from './equipos/equipos.module';
import { CommonModule } from './common/common.module';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from './chat/infrastructure/cache/redis/redis.module';
import { TicketModule } from './tickets/ticket.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Variables de entorno disponibles globalmente
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conexión global a MongoDB leyendo desde el .env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    // Módulo de Redis para el Chat
    RedisModule,

    // CommonModule se encarga de proveer PrismaService y otros servicios globales
    CommonModule,

    // Módulos de la aplicación
    AuthModule,
    UsuariosModule,
    ClientesModule,
    PlanesModule,
    EquiposModule,
    MailModule,
    ChatModule,
    TicketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
