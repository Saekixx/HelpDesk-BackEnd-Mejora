import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginRequestDto } from '../dtos/login.request.dto';
import { RegisterRequestDto } from '../dtos/register.request.dto';
import { ConfirmRegisterDto } from '../dtos/confirm-register.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.requets.dto';
import { ResetPasswordDto } from '../dtos/reset-password.requets.dto';

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

export function ApiConfirmRegisterSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Confirmar registro y activar cuenta',
      description:
        'Valida el token recibido por correo, activa la cuenta del usuario y establece su contraseña inicial.',
    }),
    ApiBody({ type: ConfirmRegisterDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Cuenta activada y contraseña registrada exitosamente.',
      schema: {
        example: {
          status: 201,
          message: 'Cuenta activada y contraseña establecida con éxito',
          data: {
            id_usuario: 2,
            nombre: 'Jack',
            correo: 'jack@empresa.com',
            estado: true,
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Token inválido, expirado o contraseña no cumple los requisitos mínimos.',
    }),
  );
}

export function ApiForgotPasswordSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Solicitar recuperación de contraseña',
      description:
        'Genera un token de restablecimiento y envía un correo electrónico si el usuario existe.',
    }),
    ApiBody({ type: ForgotPasswordDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Proceso de solicitud procesado correctamente.',
      schema: {
        example: {
          message:
            'Si el correo existe en el sistema, se ha enviado un enlace de recuperación.',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'El formato del correo electrónico es inválido.',
    }),
  );
}

export function ApiResetPasswordSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restablecer contraseña',
      description:
        'Valida el token de recuperación recibido por correo y actualiza la contraseña del usuario.',
    }),
    ApiBody({ type: ResetPasswordDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Contraseña actualizada correctamente.',
      schema: {
        example: {
          message: 'Contraseña actualizada con éxito.',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Token inválido/expirado o la contraseña no cumple con los criterios exigidos.',
    }),
  );
}
