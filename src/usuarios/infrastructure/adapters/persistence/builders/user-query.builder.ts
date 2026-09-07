import { SelectQueryBuilder } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserFilterCriteria } from '../../../../domain/criteria/user-filter.criteria';

// Clase que construye consultas para filtrar usuarios según criterios específicos
export class UserQueryBuilder {
  static applyFilters(
    query: SelectQueryBuilder<UserEntity>,
    filters: UserFilterCriteria,
  ): SelectQueryBuilder<UserEntity> {
    const { search, id_rol, id_cliente, id_sucursal, id_area, is_active } =
      filters;

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

    // Filtro por estado activo
    if (is_active !== undefined)
      query.andWhere('user.is_active = :is_active', { is_active });

    return query;
  }
}
