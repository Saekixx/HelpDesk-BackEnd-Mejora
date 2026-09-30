import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AgregarComponenteDto } from '@/equipos/domain/dto/agregar-componente.dto';

export class AgregarComponenteHttpDto implements AgregarComponenteDto {
  @ApiProperty({
    description: 'ID del componente de hardware disponible a asociar',
    example: 3,
  })
  @IsInt({ message: 'El ID de hardware debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de hardware es obligatorio' })
  readonly id_hardware: number;

  @ApiProperty({
    description: 'Número de serie específico del componente',
    example: 'SN-RAM-2026-00456',
    maxLength: 100,
  })
  @IsString({ message: 'La serie debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La serie es obligatoria' })
  @MaxLength(100, { message: 'La serie no puede exceder los 100 caracteres' })
  readonly serie: string;

  @ApiProperty({
    description: 'Nombre del proveedor del componente',
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
    description: 'Detalle o motivo de la instalación del componente',
    example: 'Ampliación de memoria RAM solicitada por el usuario',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  readonly descripcion: string;
}