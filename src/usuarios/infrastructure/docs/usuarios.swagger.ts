import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateUserRequestDto } from '../dtos/create-user.request.dto';
import { AssignRolRequestDto } from '../dtos/assign-rol.request.dto';
import { UpdateUserDto } from '../dtos/update-user.request.dto';
import { UpdateProfileDTO } from '../dtos/update-profile.request.dto';
import { UserOptions } from '../dtos/user-options.dto';
import { ProcessBulkUsersRequestDto } from '../dtos/process-bulk-users.request.dto';

export function ApiFindAllUsersSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
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
                nombre_rol: 'SOPORTE_INSITU',
                zonas: [
                  { id_zona: 1, nombre_zona: 'Lima Centro / San Isidro' },
                  { id_zona: 2, nombre_zona: 'Lima Norte' },
                ],
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
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
  );
}

export function ApiFindUserByIdSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
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
            nombre_rol: 'SOPORTE_INSITU',
            zonas: [{ id_zona: 1, nombre_zona: 'Lima Centro / San Isidro' }],
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
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
  );
}

export function ApiCreateUserSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Crear un nuevo usuario',
      description: `
Registra un nuevo usuario en el sistema aplicando las reglas jerárquicas según su **Rol**:

* **ADMINISTRADOR / SOPORTE_TECNICO:** No requieren relaciones externas (\`id_cliente\`, \`id_sucursal\`, \`id_area\`, \`zonas_ids\`).
* **SOPORTE_INSITU:** Requiere obligatoriamente asignar al menos una zona de cobertura geográfica en \`zonas_ids\`.
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
            nombre: 'Luis',
            apellido: 'Torres',
            correo: 'luis.insitu@zaint.com',
            telefono: '+51999888772',
            is_active: true,
            id_rol: 3,
            id_cliente: null,
            id_sucursal: null,
            id_area: null,
            zonas_ids: [1, 2],
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos de entrada inválidos o incumplimiento de las relaciones requeridas por el Rol especificado (ej. omitir zonas_ids para SOPORTE_INSITU).',
      schema: {
        example: {
          message:
            'El rol SOPORTE_INSITU requiere asignar al menos una zona de cobertura',
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
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
  );
}

export function ApiUpdateUserSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Actualizar un usuario por ID (Gestión Administrativa)',
      description: `
Permite a un administrador modificar la información, rol, zonas de cobertura o asignaciones corporativas de un usuario por su ID. 

* Si el rol es **SOPORTE_INSITU**, se pueden actualizar las zonas geográficas enviando \`zonas_ids: [1, 2]\`. Si se envía \`[]\`, se removerán las zonas asignadas. Si no se incluye el parámetro, se mantendrán las actuales.
* Opcionalmente permite restablecer la contraseña a la clave por defecto (\`123456\`) enviando \`resetPassword: true\`.
      `,
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del usuario a modificar',
      example: 1,
    }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Usuario actualizado exitosamente.',
      schema: {
        example: {
          message: 'Usuario actualizado exitosamente',
          data: {
            id_usuario: 3,
            nombre: 'Luis Alberto',
            apellido: 'Torres López',
            correo: 'luis.insitu@zaint.com',
            telefono: '+51999888772',
            is_active: true,
            id_rol: 3,
            id_cliente: null,
            id_sucursal: null,
            id_area: null,
            zonas_ids: [1, 2],
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos de entrada no válidos o violaciones de reglas de asignación por rol.',
      schema: {
        example: {
          message:
            'El rol SOPORTE_INSITU requiere asignar al menos una zona de cobertura',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El usuario a actualizar no existe.',
      schema: {
        example: {
          message: 'El usuario con ID 1 no existe',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'El nuevo correo electrónico ya pertenece a otro usuario.',
      schema: {
        example: {
          message: 'El correo ya está en uso por otro usuario',
          error: 'Conflict',
          statusCode: 409,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
  );
}

export function ApiUpdateProfileSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Actualizar perfil del usuario autenticado',
      description:
        'Permite al usuario autenticado modificar su propia información personal o cambiar su clave mediante el token JWT.',
    }),
    ApiBody({ type: UpdateProfileDTO }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Perfil actualizado exitosamente.',
      schema: {
        example: {
          message: 'Perfil actualizado exitosamente',
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
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token de acceso no proporcionado, expirado o inválido.',
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
        'Actualiza el rol del usuario ajustando obligatoriamente sus relaciones corporativas (cliente, sucursal, área, zonas) según la jerarquía del nuevo rol.',
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
        example: {
          message: 'Rol y asignaciones actualizados correctamente',
        },
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
        example: {
          message: 'Usuario desactivado correctamente',
        },
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

export function ApiFindUserOptionsSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Obtener opciones de usuarios para selectores / autocompletado',
      description:
        'Retorna una lista simplificada de trabajadores activos ({ id, nombre }) optimizada para alimentar elementos desplegables (<select>). Permite filtrar por coincidencia de texto (nombre, apellido o correo) y por contexto organizacional (empresa, sucursal, área).',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description:
        'Texto de búsqueda por nombre, apellido o correo electrónico',
      example: 'Juan',
    }),
    ApiQuery({
      name: 'id_sucursal',
      required: false,
      type: Number,
      description:
        'Filtrar trabajadores pertenecientes a una sucursal específica',
      example: 2,
    }),
    ApiQuery({
      name: 'id_area',
      required: false,
      type: Number,
      description: 'Filtrar trabajadores pertenecientes a un área específica',
      example: 3,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Opciones de usuarios obtenidas exitosamente.',
      type: UserOptions,
      isArray: true,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
  );
}

export function ApiGetUserStatsSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Obtener estadísticas generales de usuarios',
      description:
        'Retorna el total de usuarios (con su desglose de activos e inactivos), la cantidad de personal técnico (administradores y soporte) y la cantidad de cuentas de clientes (empresa, sucursal y trabajador).',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estadísticas de usuarios obtenidas exitosamente.',
      schema: {
        example: {
          message: 'Estadísticas de usuarios obtenidas exitosamente',
          data: {
            totalUsuarios: { cantidad: 25, activos: 22, inactivos: 3 },
            personalTecnico: { cantidad: 8 },
            cuentasClientes: { cantidad: 17 },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso administrativo.',
    }),
  );
}

export function ApiDownloadBulkUserTemplateSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Descargar la plantilla de carga masiva de usuarios',
      description:
        'Descarga un archivo Excel (.xlsx) con la hoja Usuarios y las columnas, en este orden: nombre, apellido, correo, rol, empresa, sucursal, area, estado. Incluye listas desplegables para rol y estado (ACTIVO / INACTIVO) y una hoja de instrucciones.',
    }),
    ApiProduces(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Plantilla generada exitosamente.',
      schema: { type: 'string', format: 'binary' },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso administrativo.',
    }),
  );
}

export function ApiValidateBulkUsersSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Pre-validar una carga masiva de usuarios',
      description: `
Analiza un archivo **.xlsx** o **.csv** (con las columnas de la plantilla; \`empresa\` y \`estado\` son opcionales) contra la base de datos **sin crear ningún usuario**. Máximo 5 MB y 1000 filas.

Validaciones por fila:
* **Correo:** obligatorio, con formato válido, no registrado en el sistema y no repetido dentro del archivo.
* **Rol:** debe existir en el sistema.
* **Empresa (opcional):** si se indica, debe coincidir con el nombre de la empresa de \`id_cliente\`.
* **Estado (opcional):** \`ACTIVO\` o \`INACTIVO\`; si se deja vacío se asume \`ACTIVO\`. Cualquier otro valor deja la fila en \`ERROR\`.
* **Sucursal:** debe existir y pertenecer a la empresa (\`id_cliente\`) indicada; de lo contrario la fila queda en \`ERROR\` con la observación \`Sede Inexistente\`. Es obligatoria para los roles CLIENTE_SUCURSAL y CLIENTE_TRABAJADOR.
* **Área:** si se indica, debe pertenecer a la sucursal de la fila. Es obligatoria para el rol CLIENTE_TRABAJADOR.

Si una fila tiene varios errores, las observaciones se concatenan separadas por \`; \`.
      `,
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file', 'id_cliente'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Archivo .xlsx o .csv con los usuarios a cargar',
          },
          id_cliente: {
            type: 'integer',
            example: 1,
            description: 'ID de la empresa (cliente) destino',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Validación completada (puede incluir filas con error).',
      schema: {
        example: {
          status: 200,
          message: 'Validación de la carga masiva completada',
          data: {
            totalRegistros: 3,
            validos: 1,
            conError: 2,
            detalles: [
              {
                fila: 2,
                estado: 'VALIDO',
                observacion: 'Registro válido',
                nombreCompleto: 'Ana Torres',
                correo: 'ana.torres@empresa.com',
                rol: 'CLIENTE_TRABAJADOR',
                empresa: 'Empresa Demo S.A.C.',
                sucursal: 'Sede Lima',
                area: 'Contabilidad',
                estadoUsuario: 'ACTIVO',
              },
              {
                fila: 3,
                estado: 'ERROR',
                observacion: 'Sede Inexistente',
                nombreCompleto: 'Luis Rojas',
                correo: 'luis.rojas@empresa.com',
                rol: 'CLIENTE_SUCURSAL',
                empresa: 'Empresa Demo S.A.C.',
                sucursal: 'Sede Fantasma',
                area: 'Contabilidad',
                estadoUsuario: 'ACTIVO',
              },
              {
                fila: 4,
                estado: 'ERROR',
                observacion: 'Correo ya registrado; Rol inexistente',
                nombreCompleto: 'Rosa Díaz',
                correo: 'juan.perez@empresa.com',
                rol: 'SUPERVISOR',
                empresa: '',
                sucursal: '',
                area: '',
                estadoUsuario: 'ACTIVO',
              },
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Archivo ausente, formato no admitido, sin las columnas requeridas, vacío o con más de 1000 filas; o id_cliente inválido.',
      schema: {
        example: {
          message:
            'Archivo de carga masiva inválido: faltan las columnas: sucursal, area',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'La empresa indicada en id_cliente no existe.',
    }),
    ApiResponse({
      status: HttpStatus.PAYLOAD_TOO_LARGE,
      description: 'El archivo supera el tamaño máximo de 5 MB.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso administrativo.',
    }),
  );
}

export function ApiProcessBulkUsersSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Procesar una carga masiva de usuarios',
      description: `
Registra en la empresa indicada (\`id_cliente\`) los usuarios aprobados en la pre-validación (\`POST /usuario/carga-masiva/validar\`).

* **Revalidación en servidor:** el listado se vuelve a validar con las mismas reglas de la pre-validación (correo único, rol, sucursal y área de la empresa). Las filas que no pasen se omiten y se reportan con su observación; las demás se registran.
* **Atomicidad:** todos los usuarios válidos se crean en una sola transacción. Si falla el registro (por ejemplo, un correo tomado por otro proceso) no se crea ninguno.
* **Relaciones:** se asignan \`id_rol\`, \`id_cliente\` y, según el rol, \`id_sucursal\` e \`id_area\` (CLIENTE_EMPRESA: solo empresa; CLIENTE_SUCURSAL: empresa y sucursal; CLIENTE_TRABAJADOR: empresa, sucursal y área).
* **Estado:** cada usuario se crea \`ACTIVO\` o \`INACTIVO\` según su columna \`estado\` (por defecto \`ACTIVO\`). A los usuarios \`INACTIVO\` no se les envía correo de acceso.
* **Credenciales:** las cuentas activas se crean con una contraseña aleatoria que nadie conoce. Con \`enviarCredenciales: true\` cada usuario recibe un correo con un enlace (válido 24 horas) para definir su contraseña. Con \`false\` no se envía nada y el usuario puede usar "Olvidé mi contraseña".
* Un fallo al enviar un correo no revierte la creación del usuario; se informa en \`credencialesEnviadas\` de cada fila.
* Máximo 1000 usuarios por solicitud.
      `,
    }),
    ApiBody({ type: ProcessBulkUsersRequestDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description:
        'Carga procesada. Puede incluir filas omitidas por error de validación.',
      schema: {
        example: {
          status: 201,
          message:
            'Carga masiva procesada: 2 usuario(s) creado(s), 1 con error',
          data: {
            totalRecibidos: 3,
            creados: 2,
            conError: 1,
            enviarCredenciales: true,
            credencialesEnviadas: 1,
            credencialesFallidas: 1,
            detalles: [
              {
                fila: 2,
                estado: 'CREADO',
                observacion: 'Usuario creado',
                nombreCompleto: 'Ana Torres',
                correo: 'ana.torres@empresa.com',
                rol: 'CLIENTE_TRABAJADOR',
                sucursal: 'Sede Lima',
                credencialesEnviadas: true,
              },
              {
                fila: 3,
                estado: 'CREADO',
                observacion:
                  'Usuario creado, pero no se pudo enviar el correo de acceso',
                nombreCompleto: 'Luis Rojas',
                correo: 'luis.rojas@empresa.com',
                rol: 'CLIENTE_SUCURSAL',
                sucursal: 'Sede Arequipa',
                credencialesEnviadas: false,
              },
              {
                fila: 4,
                estado: 'ERROR',
                observacion: 'Sede Inexistente',
                nombreCompleto: 'Rosa Díaz',
                correo: 'rosa.diaz@empresa.com',
                rol: 'CLIENTE_SUCURSAL',
                sucursal: 'Sede Fantasma',
                credencialesEnviadas: null,
              },
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Cuerpo inválido: id_cliente no válido, enviarCredenciales no booleano, listado vacío o con más de 1000 usuarios.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'La empresa indicada en id_cliente no existe.',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'Un correo fue registrado por otro proceso durante la carga; no se creó ningún usuario. Vuelve a validar e inténtalo de nuevo.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso administrativo.',
    }),
  );
}
