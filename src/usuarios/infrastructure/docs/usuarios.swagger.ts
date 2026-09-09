import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateUserRequestDto } from '../dtos/create-user.request.dto';
import { AssignRolRequestDto } from '../dtos/assign-rol.request.dto';

export function ApiFindAllUsersSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener lista paginada de usuarios',
      description:
        'Retorna usuarios según los filtros aplicados (búsqueda por texto, rol, cliente, sucursal, área o estado).',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lista de usuarios devuelta exitosamente.',
      schema: {
        example: {
          message: 'Usuarios obtenidos exitosamente',
          data: {
            data: [
              {
                id_usuario: 1,
                nombre: 'Juan',
                apellido: 'Pérez',
                correo: 'juan.perez@empresa.com',
                is_active: true,
              },
            ],
            meta: {
              total: 1,
              page: 1,
              lastPage: 1,
            },
          },
        },
      },
    }),
  );
}

export function ApiFindUserByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener usuario por ID',
      description:
        'Busca y retorna un usuario específico utilizando su ID primario.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del usuario',
      example: 1,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Usuario encontrado exitosamente.',
      schema: {
        example: {
          message: 'Usuario obtenido exitosamente',
          data: {
            id_usuario: 1,
            nombre: 'Juan',
            apellido: 'Pérez',
            correo: 'juan.perez@empresa.com',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'El ID proporcionado no es un número entero válido.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'No se encontró ningún usuario con el ID especificado.',
    }),
  );
}

export function ApiCreateUserSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo usuario',
      description: `
Registra un nuevo usuario en el sistema aplicando las reglas jerárquicas según su **Rol**:

* **ADMINISTRADOR / SOPORTE_INSITU / SOPORTE_REMOTO:** No requieren relaciones externas (\`id_cliente\`, \`id_sucursal\`, \`id_area\`).
* **CLIENTE_EMPRESA:** Requiere obligatoriamente \`id_cliente\`.
* **CLIENTE_SUCURSAL:** Requiere obligatoriamente \`id_cliente\` e \`id_sucursal\`.
* **CLIENTE_TRABAJADOR:** Requiere obligatoriamente \`id_cliente\`, \`id_sucursal\` e \`id_area\`.
      `,
    }),
    ApiBody({ type: CreateUserRequestDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Usuario creado exitosamente.',
      schema: {
        example: {
          message: 'Usuario creado exitosamente',
          data: {
            id_usuario: 2,
            nombre: 'Juan',
            apellido: 'Pérez',
            correo: 'juan.perez@empresa.com',
            telefono: '+51987654321',
            is_active: true,
            id_rol: 2,
            id_cliente: 1,
            id_sucursal: 1,
            id_area: 3,
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos de entrada inválidos o incumplimiento de las relaciones requeridas por el Rol especificado.',
      schema: {
        example: {
          message:
            'El rol CLIENTE_TRABAJADOR requiere cliente/empresa, sucursal y área',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'El correo electrónico ya está registrado o el rol especificado no existe.',
      schema: {
        example: {
          message: 'El correo electrónico ya está registrado',
          error: 'Conflict',
          statusCode: 409,
        },
      },
    }),
  );
}

export function ApiUpdateProfileSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Actualizar perfil de usuario autenticado',
      description:
        'Permite al usuario autenticado modificar su información personal o contraseña actualizando su estado.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Perfil actualizado exitosamente.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description:
        'Token no proporcionado, expirado o contraseña actual incorrecta.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Datos de actualización no válidos.',
    }),
  );
}

export function ApiAssignRolSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Asignar o reasignar rol a un usuario',
      description:
        'Actualiza el rol del usuario ajustando obligatoriamente sus relaciones corporativas (cliente, sucursal, área) según la jerarquía del nuevo rol.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del usuario a modificar',
      example: 1,
    }),
    ApiBody({ type: AssignRolRequestDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Rol y asignaciones actualizados correctamente.',
      schema: {
        example: 'Rol y asignaciones actualizados correctamente',
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Faltan datos requeridos para el nuevo rol o el ID no es válido.',
      schema: {
        example: {
          message:
            'El rol CLIENTE_SUCURSAL requiere cliente/empresa y sucursal',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El usuario o el rol especificado no existen.',
      schema: {
        example: {
          message: 'El rol especificado no existe',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
  );
}

export function ApiToggleUserStatusSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Activar o desactivar estado de usuario',
      description:
        'Alterna (toggle) el estado `is_active` del usuario. Impide que un usuario pueda desactivar su propia cuenta.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del usuario a activar/desactivar',
      example: 2,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estado cambiado exitosamente.',
      schema: {
        example: 'Usuario desactivado correctamente',
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Intento de auto-desactivación o ID no válido.',
      schema: {
        example: {
          message: 'No puedes desactivar tu propia cuenta',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Usuario no encontrado.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
  );
}
