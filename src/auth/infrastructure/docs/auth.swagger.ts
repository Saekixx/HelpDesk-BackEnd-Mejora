import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginRequestDto } from '../dtos/login.request.dto';
import { RegisterRequestDto } from '../dtos/register.request.dto';

export function ApiLoginSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Iniciar sesión',
      description:
        'Valida credenciales de acceso y retorna el JWT junto a la información del usuario.',
    }),
    ApiBody({ type: LoginRequestDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Inicio de sesión exitoso.',
      schema: {
        example: {
          message: 'Login exitoso',
          data: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: {
              id_usuario: 1,
              nombre: 'Jack',
              correo: 'admin@empresa.com',
              id_rol: 1,
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Credenciales inválidas o cuenta inactiva.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Parámetros de entrada no válidos.',
    }),
  );
}

export function ApiRegisterSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrar un nuevo usuario',
      description:
        'Crea una cuenta de usuario asignando rol y relaciones organizacionales.',
    }),
    ApiBody({ type: RegisterRequestDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Usuario creado exitosamente.',
      schema: {
        example: {
          message: 'Usuario registrado exitosamente',
          data: {
            id_usuario: 2,
            nombre: 'Jack',
            correo: 'jack@empresa.com',
            id_rol: 1,
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Datos inválidos o correo ya existente.',
    }),
  );
}
