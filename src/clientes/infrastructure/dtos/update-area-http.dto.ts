import { PartialType } from '@nestjs/swagger';
import { CreateAreaHttpDto } from './create-area-http.dto';
import { UpdateAreaDto } from '@/clientes/domain/dto/update-area.dto';

// PartialType hace opcionales todos los campos de CreateAreaHttpDto
// conservando sus validadores de class-validator y su documentación Swagger.
export class UpdateAreaHttpDto
  extends PartialType(CreateAreaHttpDto)
  implements UpdateAreaDto {}