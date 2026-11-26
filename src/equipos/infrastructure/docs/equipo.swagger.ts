import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiExtraModels,
  getSchemaPath,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateEquipoHttpDto } from '../dtos/create-equipo-http.dto';
import { AsignarEquipoHttpDto } from '../dtos/asignar-equipo-http.dto';
import { MontarComponenteStockHttpDto } from '../dtos/montar-componente-stock-http.dto';
import { RegistrarInstalarComponenteHttpDto } from '../dtos/registrar-instalar-componente-http.dto';
import { ReemplazarComponenteStockHttpDto } from '../dtos/reemplazar-componente-stock-http.dto';
import { RegistrarReemplazarComponenteHttpDto } from '../dtos/registrar-reemplazar-componente-http.dto';
import { EquipoDetailResponseDto } from '../dtos/equipo-detail-response.dto';
import { EquipoEstadisticasResponseDto } from '../dtos/equipo-estadisticas-response.dto';

const EQUIPO_EJEMPLO = {
  id_equipo: 1,
  tipo: 'Laptop',
  marca: 'Dell',
  nombre_equipo: 'PC-Contabilidad-01',
  num_serie: 'SN-2026-00123',
  nombre_usuario: 'Carlos Ramírez',
  id_trabajador: 5,
  id_cliente: 1,
  id_sucursal: 1,
  id_area: 1,
  is_active: true,
};

// Respuesta de PATCH /equipos/:id/estado al desactivar: el trabajador queda
// desvinculado, por eso no incluye id_trabajador ni nombre_usuario.
const EQUIPO_DESACTIVADO_EJEMPLO = {
  id_equipo: 1,
  tipo: 'Laptop',
  marca: 'Dell',
  nombre_equipo: 'PC-Contabilidad-01',
  num_serie: 'SN-2026-00123',
  id_cliente: 1,
  id_sucursal: 1,
  id_area: 1,
  is_active: false,
};

// Relaciones del listado (GET /equipos): campos completos; trabajador es null
// si el equipo no está asignado.
const RELACIONES_LISTADO_EJEMPLO = {
  cliente: { id_cliente: 1, nombre_principal: 'Acme Corp SAC' },
  sucursal: { id_sucursal: 1, nombre_sucursal: 'Sucursal Central' },
  area: { id_area: 1, nombre_area: 'Sistemas' },
  trabajador: {
    id_usuario: 5,
    nombre: 'Juan',
    apellido: 'Pérez',
    correo: 'juan.perez@acme.com',
  },
};

export function ApiFindAllEquiposSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar equipos',
      description:
        'Retorna un listado paginado de equipos. Filtros opcionales: `search` (nombre del equipo, número de serie, marca/modelo o nombre/apellido del trabajador), `id_cliente`, `id_sucursal`, `id_area`, `estado` (Activo | En_Almacen | En_Mantenimiento | Retirado), `asignacion` (Asignados | Sin Asignar), `page` y `limit`. Cada item incluye `estado` y las relaciones `cliente`, `sucursal`, `area` y `trabajador` (null si no está asignado) con sus campos completos.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Equipos obtenidos exitosamente.',
      schema: {
        example: {
          message: 'Equipos obtenidos exitosamente',
          data: {
            data: [
              {
                ...EQUIPO_EJEMPLO,
                estado: 'Activo',
                ...RELACIONES_LISTADO_EJEMPLO,
              },
            ],
            meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso de lectura.',
    }),
  );
}

// Body de ejemplo de GET /equipos/:id (Hoja de Vida del Equipo).
const EQUIPO_DETALLE_EJEMPLO = {
  id_equipo: 3,
  nombre_equipo: 'PC-DELL-90',
  tipo: 'Desktop',
  marca_modelo: 'Dell Latitude 5540',
  estado: 'Activo',
  num_serie: 'SN-2026-00123',
  ult_revision: '2026-09-01T00:00:00.000Z',
  rev_programada: '2027-03-01T00:00:00.000Z',
  is_active: true,
  created_at: '2026-11-01T15:00:00.000Z',
  updated_at: '2026-11-10T09:30:00.000Z',
  cliente: { id_cliente: 1, nombre_principal: 'Innovación Global Tech' },
  sucursal: {
    id_sucursal: 1,
    nombre_sucursal: 'Sucursal Centro Civico',
    direccion: 'Av. Garcilaso de la Vega 1234, Lima',
    encargado: 'Ana Torres',
  },
  area: { id_area: 1, nombre_area: 'Sistemas y TI' },
  trabajador: {
    id_usuario: 5,
    nombre: 'María',
    apellido: 'Vargas',
    correo: 'maria.sucursal2@empresa1.com',
    telefono: '987654321',
  },
  hardware: {
    componentes_actuales: [
      {
        id_RH: 11,
        id_hardware: 7,
        tipo_componente: 'MEMORIA_RAM',
        marca_modelo: 'Kingston Fury 16GB',
        numero_serie: 'SN-9876543210',
        proveedor: 'TechSupply Peru S.A.C.',
        url_factura: 'https://storage.empresa.com/facturas/fac-001.pdf',
        salud_smart: 'OK',
        motivo_instalacion: 'Ampliación de memoria por lentitud del equipo',
        fecha_instalacion: '2026-10-01T10:30:00.000Z',
        tecnico_responsable: {
          id_usuario: 9,
          nombre: 'Luis',
          apellido: 'Soto',
        },
        is_active: true,
      },
    ],
    historial: [
      {
        id_RH: 6,
        id_hardware: 4,
        tipo_componente: 'MEMORIA_RAM',
        marca_modelo: 'Generic 8GB',
        numero_serie: 'SN-1100234988',
        proveedor: 'TechSupply Peru S.A.C.',
        fecha_instalacion: '2026-03-15T09:00:00.000Z',
        fecha_retiro: '2026-10-01T10:30:00.000Z',
        motivo_retiro: 'Falla detectada en pruebas de memoria',
        tecnico_responsable: {
          id_usuario: 9,
          nombre: 'Luis',
          apellido: 'Soto',
        },
        is_active: false,
      },
    ],
  },
  software: [
    {
      id_software_equipos: 4,
      id_software: 2,
      nombre_software: 'Microsoft Office 365',
      categoria: 'Ofimática',
      tipo_licencia: 'Pool_Limitado',
      licencia_asignada: 'XXXXX-XXXXX-XXXXX',
      correo_asociado: 'licencias@empresa1.com',
      password_enc: '**********',
      fecha_instalacion: '2026-10-02T08:00:00.000Z',
      vencimiento: '2027-01-01T00:00:00.000Z',
      observaciones: 'Licencia renovada anualmente',
      is_active: true,
    },
  ],
};

export function ApiFindEquipoByIdSwagger() {
  return applyDecorators(
    ApiExtraModels(EquipoDetailResponseDto),
    ApiOperation({
      summary: 'Obtener la hoja de vida de un equipo por id',
      description:
        'Retorna el equipo con su cliente, sucursal (dirección y encargado), área y trabajador asignado; el hardware separado en `componentes_actuales` (con motivo de instalación) e `historial` de componentes retirados; y las licencias de software asignadas. Solo el ADMINISTRADOR recibe `password_enc` de las licencias; para los demás roles viene enmascarada como `**********`.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo',
      example: 3,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Equipo obtenido exitosamente.',
      schema: {
        properties: {
          status: { type: 'number', example: HttpStatus.OK },
          message: {
            type: 'string',
            example: 'Equipo obtenido exitosamente',
          },
          data: { $ref: getSchemaPath(EquipoDetailResponseDto) },
        },
        example: {
          status: HttpStatus.OK,
          message: 'Equipo obtenido exitosamente',
          data: EQUIPO_DETALLE_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'El id enviado no es un número válido.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso de lectura.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El equipo no existe.',
    }),
  );
}

// Bodies de ejemplo de POST /equipos.
const CREAR_EQUIPO_CON_TRABAJADOR_EJEMPLO = {
  nombre_equipo: 'PC-DELL-90',
  num_serie: 'SN-2026-00123',
  tipo: 'Desktop',
  marca_modelo: 'Dell Latitude 5540',
  id_cliente: 1,
  id_sucursal: 1,
  id_area: 1,
  id_trabajador: 5,
};
const CREAR_EQUIPO_SIN_TRABAJADOR_EJEMPLO = {
  nombre_equipo: 'LAP-HP-12',
  num_serie: 'SN-2026-00456',
  tipo: 'Laptop',
  marca_modelo: 'HP ProBook 450 G9',
  id_cliente: 1,
  id_sucursal: 1,
  id_area: 1,
};

// Equipo recién registrado (POST /equipos). Sin trabajador: `trabajador` es
// null y `estado` es "En_Almacen".
const EQUIPO_CREADO_EJEMPLO = {
  id_equipo: 3,
  nombre_equipo: 'PC-DELL-90',
  tipo: 'Desktop',
  marca_modelo: 'Dell Latitude 5540',
  num_serie: 'SN-2026-00123',
  estado: 'Activo',
  ult_revision: null,
  rev_programada: null,
  cliente: { id_cliente: 1, nombre_principal: 'Innovación Global Tech' },
  sucursal: { id_sucursal: 1, nombre_sucursal: 'Sucursal Centro Civico' },
  area: { id_area: 1, nombre_area: 'Sistemas y TI' },
  trabajador: {
    id_usuario: 5,
    nombre: 'María',
    apellido: 'Vargas',
    correo: 'maria.sucursal2@empresa1.com',
  },
  created_at: '2026-11-16T19:30:00.000Z',
};

export function ApiCreateEquipoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrar un equipo',
      description:
        'Registra un equipo con su ubicación (cliente, sucursal y área) y, opcionalmente, un trabajador asignado. Valida que la sucursal pertenezca al cliente, el área a la sucursal y el trabajador al cliente. El estado se asigna automáticamente: `Activo` si se envía `id_trabajador`, `En_Almacen` si no (en ese caso `trabajador` es null en la respuesta).',
    }),
    ApiBody({
      type: CreateEquipoHttpDto,
      examples: {
        conTrabajador: {
          summary: 'Con trabajador asignado (estado Activo)',
          value: CREAR_EQUIPO_CON_TRABAJADOR_EJEMPLO,
        },
        sinTrabajador: {
          summary: 'Sin trabajador (estado En_Almacen)',
          value: CREAR_EQUIPO_SIN_TRABAJADOR_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Equipo creado exitosamente.',
      schema: {
        example: {
          status: HttpStatus.CREATED,
          message: 'Equipo creado exitosamente',
          data: EQUIPO_CREADO_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos inválidos o jerarquía incorrecta: la sucursal no pertenece al cliente, el área no pertenece a la sucursal o el trabajador no pertenece al cliente.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso administrativo.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description:
        'El cliente, la sucursal, el área o el trabajador no existen o están inactivos.',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'El número de serie ya está registrado en otro equipo.',
    }),
  );
}

export function ApiCambiarEstadoEquipoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Activar/desactivar un equipo',
      description:
        'Alterna el estado lógico del equipo (`is_active`) y mantiene coherentes `estado` y `id_trabajador`. No recibe body. Al desactivar (baja lógica): `is_active = false`, `estado = Retirado` y `id_trabajador = null` (se desvincula al trabajador, ya que un equipo retirado no puede seguir en custodia). Al reactivar: `is_active = true` y `estado = En_Almacen`, quedando disponible en inventario para una nueva asignación con `PATCH /equipos/:id/asignar`. Un equipo desactivado deja de aparecer en las opciones y en las estadísticas del inventario y no se puede asignar.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo a activar/desactivar',
      example: 1,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estado del equipo actualizado exitosamente.',
      schema: {
        example: {
          message: 'Estado del equipo actualizado exitosamente',
          data: EQUIPO_DESACTIVADO_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description:
        'El rol del usuario no puede cambiar el estado de equipos (se permite a ADMINISTRADOR, SOPORTE_TECNICO y SOPORTE_INSITU).',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El equipo no existe.',
    }),
  );
}

const ROLES_ASIGNACION =
  'El rol del usuario no puede liberar ni asignar equipos (se permite a ADMINISTRADOR, SOPORTE_TECNICO y SOPORTE_INSITU).';

export function ApiLiberarEquipoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Liberar un equipo',
      description:
        'Desvincula al trabajador del equipo (`id_trabajador = null`) y lo deja en estado `En_Almacen`. No recibe body. Liberar un equipo que ya está libre no produce error.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo a liberar',
      example: 1,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Equipo liberado exitosamente.',
      schema: {
        example: {
          status: HttpStatus.OK,
          message: 'Equipo liberado exitosamente',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'El ID del equipo no es un número válido.',
      schema: {
        example: {
          status: HttpStatus.BAD_REQUEST,
          message: 'Validation failed (numeric string is expected)',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: ROLES_ASIGNACION,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El equipo no existe.',
      schema: {
        example: {
          status: HttpStatus.NOT_FOUND,
          message: 'Equipo no encontrado',
          data: null,
        },
      },
    }),
  );
}

export function ApiAsignarEquipoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Asignar un equipo a un trabajador',
      description:
        'Asigna el equipo al trabajador indicado, lo deja en estado `Activo` y guarda las observaciones si se envían (si se omiten, la observación actual no cambia). El trabajador debe existir, estar activo y pertenecer al mismo cliente del equipo; el equipo debe estar activo.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo a asignar',
      example: 1,
    }),
    ApiBody({
      type: AsignarEquipoHttpDto,
      examples: {
        conObservaciones: {
          summary: 'Asignación con observaciones',
          value: {
            id_trabajador: 5,
            observaciones: 'Entrega de laptop por ingreso a contabilidad',
          },
        },
        sinObservaciones: {
          summary: 'Asignación sin observaciones',
          value: { id_trabajador: 5 },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Equipo asignado exitosamente.',
      schema: {
        example: {
          status: HttpStatus.OK,
          message: 'Equipo asignado exitosamente',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos inválidos (ID del equipo no numérico, `id_trabajador` ausente o no entero, observaciones que superan 500 caracteres, propiedades no permitidas) o el trabajador pertenece a otro cliente.',
      content: {
        'application/json': {
          examples: {
            validacion: {
              summary: 'Falta id_trabajador',
              value: {
                status: HttpStatus.BAD_REQUEST,
                message:
                  'El ID del trabajador debe ser mayor o igual a 1, El ID del trabajador debe ser un número entero, El ID del trabajador es obligatorio',
                data: null,
              },
            },
            otroCliente: {
              summary: 'Trabajador de otro cliente',
              value: {
                status: HttpStatus.BAD_REQUEST,
                message:
                  'El trabajador seleccionado no pertenece al cliente indicado',
                data: null,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: ROLES_ASIGNACION,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description:
        'El equipo no existe, o el trabajador no existe o está inactivo.',
      content: {
        'application/json': {
          examples: {
            equipo: {
              summary: 'Equipo no encontrado',
              value: {
                status: HttpStatus.NOT_FOUND,
                message: 'Equipo no encontrado',
                data: null,
              },
            },
            trabajador: {
              summary: 'Trabajador no disponible',
              value: {
                status: HttpStatus.NOT_FOUND,
                message: 'El trabajador asignado no existe o está inactivo',
                data: null,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'El equipo está desactivado y no se puede asignar.',
      schema: {
        example: {
          status: HttpStatus.CONFLICT,
          message: 'El equipo está desactivado y no se puede asignar',
          data: null,
        },
      },
    }),
  );
}

export function ApiMontarComponenteStockSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Montar en un equipo un componente que está en stock',
      description:
        'Instala en el equipo un componente de hardware en estado "Disponible" y sin equipo asignado. En una sola transacción el componente pasa a "Instalado" y se crea su movimiento actual en el historial del equipo (fecha de instalación, observaciones como motivo y el usuario autenticado como técnico responsable). El equipo debe estar activo. Si otra operación toma el componente primero, responde 409 y no se escribe nada.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo donde se monta el componente',
      example: 1,
    }),
    ApiBody({
      type: MontarComponenteStockHttpDto,
      examples: {
        completo: {
          summary: 'Con observaciones',
          value: {
            id_hardware: 15,
            fecha_instalacion: '2026-11-17',
            observaciones: 'Ampliación de memoria solicitada por el usuario',
          },
        },
        minimo: {
          summary: 'Solo campos obligatorios',
          value: { id_hardware: 15, fecha_instalacion: '2026-11-17' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Componente montado exitosamente.',
      schema: {
        example: { message: 'Componente montado exitosamente', data: null },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos de entrada inválidos (ID de hardware o fecha no válidos, propiedades no permitidas) o ID de equipo no numérico.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description:
        'El rol del usuario no tiene permiso (solo ADMINISTRADOR, SOPORTE_TECNICO o SOPORTE_INSITU).',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description:
        'El equipo, el componente de hardware o el técnico responsable no existen.',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'El equipo está desactivado o retirado, o el componente no está "Disponible" o ya tiene un equipo asignado.',
    }),
  );
}

export function ApiRegistrarEInstalarComponenteSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrar un componente nuevo e instalarlo en un equipo',
      description:
        'Crea un componente de hardware nuevo y lo deja instalado en el equipo. En una sola transacción se crea el componente (estado "Instalado") y su movimiento actual en el historial del equipo, con el usuario autenticado como técnico responsable; si algo falla no queda ni el componente ni el movimiento. El equipo debe estar activo y el número de serie no puede estar registrado en otro componente.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo donde se instala el componente',
      example: 1,
    }),
    ApiBody({
      type: RegistrarInstalarComponenteHttpDto,
      examples: {
        completo: {
          summary: 'Con todos los campos',
          value: {
            tipo_componente: 'MEMORIA_RAM',
            marca_modelo: 'Kingston Fury 16GB DDR4',
            numero_serie: 'SN-RAM-2026-00456',
            proveedor: 'Tecnoglobal S.A.C.',
            fecha_compra: '2026-10-05',
            url_factura: 'facturas/fac-001.pdf',
            fecha_instalacion: '2026-11-17',
            observaciones:
              'Componente nuevo instalado por ampliación de memoria',
          },
        },
        minimo: {
          summary: 'Solo campos obligatorios',
          value: {
            tipo_componente: 'ALMACENAMIENTO_SSD',
            marca_modelo: 'Samsung 970 EVO 1TB',
            numero_serie: 'SN-SSD-2026-00789',
            fecha_instalacion: '2026-11-17',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Componente registrado e instalado exitosamente.',
      schema: {
        example: {
          message: 'Componente registrado e instalado exitosamente',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos de entrada inválidos (tipo de componente fuera del enum, campos obligatorios ausentes, fechas no válidas, textos demasiado largos, propiedades no permitidas) o ID de equipo no numérico.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description:
        'El rol del usuario no tiene permiso (solo ADMINISTRADOR, SOPORTE_TECNICO o SOPORTE_INSITU).',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El equipo o el técnico responsable no existen.',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'El equipo está desactivado o retirado, o el número de serie ya está registrado en otro componente.',
    }),
  );
}

export function ApiReemplazarComponenteStockSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reemplazar un componente de un equipo con una pieza de stock',
      description:
        'Retira el componente actual del equipo y monta en su lugar un componente en estado "Disponible". En una sola transacción: el componente actual pasa a "Baja / Descarte", queda sin equipo y su movimiento activo se cierra (fecha de retiro = fecha de reemplazo, motivo de retiro = observaciones); el componente nuevo pasa a "Instalado" y se crea su movimiento actual con el usuario autenticado como técnico responsable. El equipo debe estar activo y el componente actual debe estar instalado en él. Si algo falla no se aplica ningún cambio.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo donde se hace el reemplazo',
      example: 1,
    }),
    ApiParam({
      name: 'idHardwareActual',
      description:
        'ID del componente de hardware instalado actualmente en el equipo, que será retirado',
      example: 12,
    }),
    ApiBody({
      type: ReemplazarComponenteStockHttpDto,
      examples: {
        completo: {
          summary: 'Con observaciones',
          value: {
            id_hardware_nuevo: 15,
            fecha_reemplazo: '2026-11-17',
            observaciones: 'El disco anterior presentaba sectores dañados',
          },
        },
        minimo: {
          summary: 'Solo campos obligatorios',
          value: { id_hardware_nuevo: 15, fecha_reemplazo: '2026-11-17' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Componente reemplazado exitosamente.',
      schema: {
        example: { message: 'Componente reemplazado exitosamente', data: null },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos de entrada inválidos (ID de hardware o fecha no válidos, propiedades no permitidas) o algún ID de la ruta no es numérico.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description:
        'El rol del usuario no tiene permiso (solo ADMINISTRADOR, SOPORTE_TECNICO o SOPORTE_INSITU).',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description:
        'El equipo, el componente nuevo o el técnico responsable no existen, o el componente actual no existe o no está instalado en este equipo.',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'El equipo está desactivado o retirado, o el componente nuevo no está "Disponible", ya tiene un equipo asignado o es el mismo componente que se retira.',
    }),
  );
}

export function ApiRegistrarEReemplazarComponenteSwagger() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Reemplazar un componente de un equipo registrando una pieza nueva',
      description:
        'Retira el componente actual del equipo y registra un componente nuevo ya instalado en su lugar. En una sola transacción: el componente actual pasa a "Baja / Descarte", queda sin equipo y su movimiento activo se cierra (fecha de retiro = fecha de reemplazo, motivo de retiro = observaciones); se crea el componente nuevo (estado "Instalado") con su movimiento actual y el usuario autenticado como técnico responsable. El equipo debe estar activo, el componente actual debe estar instalado en él y el número de serie nuevo no puede estar registrado en otro componente. Si algo falla no queda ni el componente nuevo ni cambios en el actual.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo donde se hace el reemplazo',
      example: 1,
    }),
    ApiParam({
      name: 'idHardwareActual',
      description:
        'ID del componente de hardware instalado actualmente en el equipo, que será retirado',
      example: 12,
    }),
    ApiBody({
      type: RegistrarReemplazarComponenteHttpDto,
      examples: {
        completo: {
          summary: 'Con todos los campos',
          value: {
            tipo_componente: 'ALMACENAMIENTO_SSD',
            marca_modelo: 'Samsung 970 EVO 1TB',
            numero_serie: 'SN-SSD-2026-00789',
            proveedor: 'Tecnoglobal S.A.C.',
            fecha_compra: '2026-10-05',
            url_factura: 'facturas/fac-001.pdf',
            fecha_reemplazo: '2026-11-17',
            observaciones: 'El disco anterior presentaba sectores dañados',
          },
        },
        minimo: {
          summary: 'Solo campos obligatorios',
          value: {
            tipo_componente: 'MEMORIA_RAM',
            marca_modelo: 'Kingston Fury 16GB DDR4',
            numero_serie: 'SN-RAM-2026-00456',
            fecha_reemplazo: '2026-11-17',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Componente registrado y reemplazado exitosamente.',
      schema: {
        example: {
          message: 'Componente registrado y reemplazado exitosamente',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos de entrada inválidos (tipo de componente fuera del enum, campos obligatorios ausentes, fechas no válidas, textos demasiado largos, propiedades no permitidas) o algún ID de la ruta no es numérico.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description:
        'El rol del usuario no tiene permiso (solo ADMINISTRADOR, SOPORTE_TECNICO o SOPORTE_INSITU).',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description:
        'El equipo o el técnico responsable no existen, o el componente actual no existe o no está instalado en este equipo.',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'El equipo está desactivado o retirado, o el número de serie ya está registrado en otro componente.',
    }),
  );
}

// Items de ejemplo de GET /equipos/options (EquipoOptionItem). Los campos
// opcionales pueden venir en null (ej. un equipo sin nombre ni número de serie).
const EQUIPO_OPTIONS_EJEMPLO = [
  {
    id_equipo: 1,
    nombre_equipo: 'PC-Contabilidad-01',
    num_serie: 'SN-2026-00123',
    tipo: 'Laptop',
    marca_modelo: 'Dell Latitude 5420',
    estado: 'Activo',
  },
  {
    id_equipo: 2,
    nombre_equipo: 'Laptop-Soporte-02',
    num_serie: 'SN-2026-00456',
    tipo: 'Laptop',
    marca_modelo: 'Lenovo ThinkPad T14',
    estado: 'En_Mantenimiento',
  },
  {
    id_equipo: 3,
    nombre_equipo: null,
    num_serie: null,
    tipo: 'Servidor',
    marca_modelo: null,
    estado: 'En_Almacen',
  },
];

export function ApiGetEquipoOptionsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener opciones de equipos para selectores',
      description:
        'Devuelve un listado ligero (sin paginación) de los equipos activos, ordenado por nombre, para alimentar desplegables y selectores en cascada del frontend. Todos los filtros son opcionales y combinables: `id_cliente`, `id_sucursal`, `id_area`, `estado` (Activo | En_Almacen | En_Mantenimiento | Retirado; acepta también la etiqueta, ej. "En Almacén") y `search` (búsqueda parcial por nombre del equipo, número de serie o marca/modelo). Los filtros vacíos ("", "null" o "undefined") se ignoran. Los equipos dados de baja no se listan.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description:
        'Opciones de equipos obtenidas exitosamente. Retorna un arreglo vacío si ningún equipo coincide con los filtros.',
      schema: {
        example: {
          status: HttpStatus.OK,
          message: 'Opciones de equipos obtenidas exitosamente',
          data: EQUIPO_OPTIONS_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Algún filtro es inválido (id no entero positivo, estado desconocido o búsqueda demasiado larga).',
      schema: {
        example: {
          status: HttpStatus.BAD_REQUEST,
          message: [
            'El estado debe ser uno de: Activo, En_Almacen, En_Mantenimiento, Retirado',
          ],
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso de lectura.',
    }),
  );
}

// Ejemplo de KPI: asignados + sin_asignar = total_equipos.
const EQUIPO_ESTADISTICAS_EJEMPLO = {
  total_equipos: 1294,
  asignados: 1148,
  sin_asignar: 146,
};

export function ApiGetEquipoEstadisticasSwagger() {
  return applyDecorators(
    ApiExtraModels(EquipoEstadisticasResponseDto),
    ApiOperation({
      summary: 'Obtener estadísticas del inventario de equipos',
      description:
        'Retorna el conteo global de equipos activos registrados (`total_equipos`), de los asignados a un trabajador (`asignados`) y de los que no tienen trabajador (`sin_asignar`); `asignados` + `sin_asignar` equivale a `total_equipos`. Los equipos dados de baja no se cuentan. No acepta filtros ni paginación. Alimenta las tarjetas KPI de la cabecera del módulo de Inventario de Equipos.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description:
        'Estadísticas del inventario de equipos obtenidas exitosamente.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.OK },
          message: {
            type: 'string',
            example:
              'Estadísticas del inventario de equipos obtenidas exitosamente',
          },
          data: { $ref: getSchemaPath(EquipoEstadisticasResponseDto) },
        },
        example: {
          status: HttpStatus.OK,
          message:
            'Estadísticas del inventario de equipos obtenidas exitosamente',
          data: EQUIPO_ESTADISTICAS_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso de lectura.',
    }),
  );
}
