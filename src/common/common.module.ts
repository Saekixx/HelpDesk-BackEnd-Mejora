// src/common/infrastructure/common.module.ts
import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './infrastructure/filters/global-exception.filter';
import { ResponseInterceptor } from './infrastructure/interceptors/response.interceptor';
import { PrismaService } from './infrastructure/prisma/prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
  exports: [PrismaService], // Permite inyectar PrismaService en cualquier repositorio
})
export class CommonModule {}
