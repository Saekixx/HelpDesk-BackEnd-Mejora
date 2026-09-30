import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ReemplazarComponenteDto } from '@/equipos/domain/dto/reemplazar-componente.dto';

export class ReemplazarComponenteHttpDto implements ReemplazarComponenteDto {
  @ApiProperty({
    description:
      'ID del registro (id_RH) del componente actual que sale del equipo',
    example: 12,
  })
  @IsInt({ message: 'El ID del registro saliente debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del registro saliente es obligatorio' })
  readonly id_RH_saliente: number;

  @ApiProperty({
    description: 'ID del componente de hardware disponible que lo reemplaza',
    example: 7,
  })
  @IsInt({ message: 'El ID de hardware nuevo debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de hardware nuevo es obligatorio' })
  readonly id_hardware_nuevo: number;

  @ApiProperty({
    description: 'Número de serie específico del componente nuevo',
    example: 'SN-SSD-2026-00789',
    maxLength: 100,
  })
  @IsString({ message: 'La serie debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La serie es obligatoria' })
  @MaxLength(100, { message: 'La serie no puede exceder los 100 caracteres' })
  readonly serie: string;

  @ApiProperty({
    description: 'Nombre del proveedor del componente nuevo',
    example: 'Tecnoglobal S.A.C.',
    maxLength: 255,
  })
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El proveedor es obligatorio' })
  @MaxLength(255, {
    message: 'El proveedor no puede exceder los 255 caracteres',
  })
  readonly proveedor: string;

  @ApiProperty({
    description: 'Detalle o motivo del reemplazo del componente',
    example: 'El disco anterior presentaba sectores dañados',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  readonly descripcion: string;
}