import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCitaDto {
  @ApiProperty({
    description:
      'Token de bloqueo (SoftLock) que garantiza la reserva temporal de la franja horaria.',
    example: 'abc123xyz',
  })
  @IsNotEmpty()
  @IsString()
  lock_token: string;

  @ApiProperty({
    description:
      'ID del ticket que se va a derivar a atención presencial (In-Situ).',
    example: 123,
  })
  @IsNotEmpty()
  @IsNumber()
  id_ticket: number;

  @ApiProperty({
    description: 'ID de la sucursal donde se realizará la atención presencial.',
    example: 456,
  })
  @IsNotEmpty()
  @IsNumber()
  id_sucursal: number;

  @ApiProperty({
    description: 'ID del usuario que está ejecutando la derivación del ticket.',
    example: 789,
  })
  @IsNotEmpty()
  @IsNumber()
  id_usuario: number;

  @ApiProperty({
    description:
      'Observaciones adicionales sobre la cita o la derivación del ticket.',
    example: 'El cliente solicita atención urgente.',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
