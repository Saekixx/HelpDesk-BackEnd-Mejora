// src/infrastructure/common/interceptors/response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// ApiResponse es una interfaz que define la estructura de la respuesta estándar que se enviará al cliente.
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T | null;
}

// ResponseInterceptor es un interceptor que se encarga de transformar la respuesta de los controladores
//  y casos de uso en un formato estándar antes de enviarla al cliente. Esto permite mantener una estructura
//  consistente en todas las respuestas de la API.

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
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((result) => {
        // Caso 1: El Controller devolvió un mensaje de éxito como string
        // Ejemplo: return 'Usuario creado exitosamente';
        if (typeof result === 'string') {
          return {
            status: statusCode,
            message: result,
            data: null,
          };
        }

        // Caso 2: El Controller devolvió un objeto con mensaje y data separados
        // Ejemplo: return { message: 'Lista de usuarios traída correctamente', data: usuarios };
        if (
          result &&
          typeof result === 'object' &&
          'message' in result &&
          'data' in result
        ) {
          return {
            status: statusCode,
            message: result.message,
            data: result.data,
          };
        }

        // Caso 3: Devuelves los datos directamente (Array, Objeto de entidad, etc.)
        return {
          status: statusCode,
          message: 'Operación realizada con éxito',
          data: result ?? null,
        };
      }),
    );
  }
}
