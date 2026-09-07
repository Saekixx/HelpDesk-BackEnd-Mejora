// src/infrastructure/common/interceptors/response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// ApiResponse es una interfaz que define la estructura de la respuesta HTTP que se enviará al cliente.
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// ResponseInterceptor es un interceptor que transforma la respuesta de la aplicación
// en un formato consistente antes de enviarla al cliente.
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        status: response.statusCode,
        message: 'Operación realizada con éxito',
        data: data ?? null,
      })),
    );
  }
}
