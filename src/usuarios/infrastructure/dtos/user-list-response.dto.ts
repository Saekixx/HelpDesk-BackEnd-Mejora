import { ApiProperty } from '@nestjs/swagger';
import {
  UserEstado,
  UserListItemCriteria,
} from '@/usuarios/domain/criteria/user-list-item.criteria';

// Ítem del listado de usuarios (GET /usuario)
export class UserListItemResponseDto implements UserListItemCriteria {
  @ApiProperty({ description: 'Identificador único del usuario', example: 1 })
  id_usuario: number;

  @ApiProperty({ example: 'Ana' })
  nombre: string;

  @ApiProperty({ example: 'Torres' })
  apellido: string;

  @ApiProperty({ example: 'ana.torres@empresa.com' })
  correo: string;

  @ApiProperty({
    description: 'Nombre legible del rol',
    example: 'CLIENTE_EMPRESA',
  })
  rol: string;

  @ApiProperty({
    description: 'Nombre de la empresa vinculada. null si no pertenece a una.',
    example: 'Banco Andino S.A.',
    nullable: true,
    type: String,
  })
  empresa: string | null;

  @ApiProperty({
    description: 'Nombre de la sucursal. null si no tiene.',
    example: 'Sede Lima',
    nullable: true,
    type: String,
  })
  sucursal: string | null;

  @ApiProperty({
    description: 'Nombre del área. null si no tiene.',
    example: 'Contabilidad',
    nullable: true,
    type: String,
  })
  area: string | null;

  @ApiProperty({
    description: 'Estado del usuario (mapeado desde is_active)',
    enum: ['ACTIVO', 'INACTIVO'],
    example: 'ACTIVO',
  })
  estado: UserEstado;
}

// Metadatos de paginación
export class UserPaginationMetaResponseDto {
  @ApiProperty({
    description: 'Total de registros que cumplen el filtro',
    example: 42,
  })
  total: number;

  @ApiProperty({ description: 'Página actual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Registros por página', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de páginas', example: 5 })
  totalPages: number;
}

// Cuerpo de `data` en la respuesta paginada: { data: [...], meta: {...} }
export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserListItemResponseDto] })
  data: UserListItemResponseDto[];

  @ApiProperty({ type: UserPaginationMetaResponseDto })
  meta: UserPaginationMetaResponseDto;
}
