// src/usuarios/infrastructure/persistence/builders/user-query.builder.ts

import { SelectQueryBuilder } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserFilterCriteria } from '../../../../domain/criteria/user-filter.criteria';

export class UserQueryBuilder {
  static applyFilters(
    query: SelectQueryBuilder<UserEntity>,
    filters: UserFilterCriteria,
  ): SelectQueryBuilder<UserEntity> {
    const { search, id_rol, id_cliente, id_sucursal, id_area, is_active } =
      filters;

    // Cargar relaciones para obtener los datos asociados
    query
      .leftJoinAndSelect('user.rol', 'rol')
      .leftJoinAndSelect('user.cliente', 'cliente')
      .leftJoinAndSelect('user.sucursal', 'sucursal')
      .leftJoinAndSelect('user.area', 'area');

    // Búsqueda por texto (nombre, apellido o correo)
    if (search) {
      query.andWhere(
        '(LOWER(user.nombre) LIKE LOWER(:search) OR LOWER(user.apellido) LIKE LOWER(:search) OR LOWER(user.correo) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Filtros por IDs exactos
    if (id_rol) query.andWhere('user.id_rol = :id_rol', { id_rol });
    if (id_cliente)
      query.andWhere('user.id_cliente = :id_cliente', { id_cliente });
    if (id_sucursal)
      query.andWhere('user.id_sucursal = :id_sucursal', { id_sucursal });
    if (id_area) query.andWhere('user.id_area = :id_area', { id_area });

    // Filtro por estado activo con protección contra transformaciones
    if (
      is_active !== undefined &&
      is_active !== null &&
      String(is_active) !== ''
    ) {
      const boolActive =
        is_active === true || String(is_active).toLowerCase() === 'true';

      query.andWhere('user.is_active = :is_active', { is_active: boolActive });
    }

    return query;
  }
}
