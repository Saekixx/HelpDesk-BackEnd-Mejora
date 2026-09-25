import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignSupportCommand {
  @ApiProperty({
    description: 'ID del ticket al cual se le asignará el técnico',
    example: 104,
  })
  @IsInt()
  @IsNotEmpty()
  id_ticket: number;

  @ApiProperty({
    description: 'ID del usuario técnico de soporte que atenderá el ticket',
    example: 8,
  })
  @IsInt()
  @IsNotEmpty()
  id_soporte: number;
}
