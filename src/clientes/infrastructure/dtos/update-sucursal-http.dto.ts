import { PartialType } from '@nestjs/swagger';
import { CreateSucursalHttpDto } from './create-sucursal-http.dto';
import { UpdateSucursalDto } from '@/clientes/domain/dto/update-sucursal.dto';

// PartialType hace opcionales todos los campos de CreateSucursalHttpDto
// conservando sus validadores de class-validator y su documentación Swagger.
export class UpdateSucursalHttpDto
  extends PartialType(CreateSucursalHttpDto)
  implements UpdateSucursalDto {}