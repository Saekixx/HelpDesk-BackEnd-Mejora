import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Campos de texto del multipart/form-data (el archivo llega aparte, en el campo "file")
export class ValidateBulkUsersRequestDto {
  @ApiProperty({
    description: 'ID de la empresa (cliente) destino de la carga masiva',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'id_cliente debe ser un número entero' })
  @Min(1, { message: 'id_cliente debe ser mayor a 0' })
  id_cliente: number;
}
