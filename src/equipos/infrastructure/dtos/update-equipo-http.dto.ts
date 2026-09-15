import { PartialType } from '@nestjs/swagger';
import { CreateEquipoHttpDto } from './create-equipo-http.dto';
import { UpdateEquipoDto } from '@/equipos/domain/dto/update-equipo.dto';

// PartialType hace opcionales todos los campos de CreateEquipoHttpDto
// conservando sus validadores de class-validator y su documentación Swagger.
export class UpdateEquipoHttpDto
  extends PartialType(CreateEquipoHttpDto)
  implements UpdateEquipoDto {}