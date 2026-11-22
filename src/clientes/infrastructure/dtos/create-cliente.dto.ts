import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateClienteCommand,
  DatosEmpresaCommand,
  ResponsableCommand,
  SucursalPrincipalCommand,
  TipoCliente,
} from '@/clientes/domain/entities/cliente.entity';

// Paso 1 del modal: datos de la empresa
export class DatosEmpresaDto implements DatosEmpresaCommand {
  @ApiProperty({
    enum: TipoCliente,
    description: 'Tipo de cliente',
    example: TipoCliente.JURIDICA,
  })
  @IsNotEmpty({ message: 'El tipo de cliente es obligatorio' })
  @IsEnum(TipoCliente, {
    message: 'El tipo de cliente debe ser JURIDICA o NATURAL',
  })
  readonly tipo_cliente: TipoCliente;

  @ApiProperty({
    description: 'Número de documento (RUC/DNI)',
    example: '20123456789',
  })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @IsString({ message: 'El número de documento debe ser una cadena de texto' })
  readonly numero_documento: string;

  @ApiProperty({
    description: 'Nombre o razón social del cliente',
    example: 'Acme Corp SAC',
  })
  @IsNotEmpty({ message: 'El nombre principal es obligatorio' })
  @IsString({ message: 'El nombre principal debe ser una cadena de texto' })
  readonly nombre_principal: string;

  @ApiPropertyOptional({
    description: 'Dirección fiscal',
    example: 'Av. Siempre Viva 123',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  readonly direccion?: string;

  @ApiPropertyOptional({
    description: 'Rubro o sector económico',
    example: 'Retail',
  })
  @IsOptional()
  @IsString({ message: 'El rubro debe ser una cadena de texto' })
  readonly rubro?: string;

  @ApiProperty({ description: 'ID del plan contratado', example: 1 })
  @IsNotEmpty({ message: 'El ID de plan es obligatorio' })
  @IsInt({ message: 'El ID de plan debe ser un número entero' })
  readonly id_plan: number;
}

// Paso 2 del modal: persona responsable de la empresa
export class ResponsableDto implements ResponsableCommand {
  @ApiProperty({ description: 'Nombre del responsable', example: 'Carlos' })
  @IsNotEmpty({ message: 'El nombre del responsable es obligatorio' })
  @IsString({
    message: 'El nombre del responsable debe ser una cadena de texto',
  })
  readonly nombre: string;

  @ApiProperty({ description: 'Apellido del responsable', example: 'Mendoza' })
  @IsNotEmpty({ message: 'El apellido del responsable es obligatorio' })
  @IsString({
    message: 'El apellido del responsable debe ser una cadena de texto',
  })
  readonly apellido: string;

  @ApiPropertyOptional({
    description: 'Cargo del responsable dentro de la empresa',
    example: 'Gerente de TI',
  })
  @IsOptional()
  @IsString({ message: 'El cargo debe ser una cadena de texto' })
  readonly cargo?: string;

  @ApiProperty({
    description: 'Teléfono de contacto del responsable',
    example: '987654321',
  })
  @IsNotEmpty({ message: 'El teléfono del responsable es obligatorio' })
  @IsString({
    message: 'El teléfono del responsable debe ser una cadena de texto',
  })
  readonly telefono: string;

  @ApiProperty({
    description: 'Correo del responsable (será su usuario de acceso)',
    example: 'carlos.mendoza@acme.com',
  })
  @IsNotEmpty({ message: 'El correo del responsable es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  readonly correo: string;
}

// Paso 3 del modal: sucursal principal
export class SucursalPrincipalDto implements SucursalPrincipalCommand {
  @ApiProperty({
    description: 'Nombre de la sucursal principal',
    example: 'Sede Central',
  })
  @IsNotEmpty({ message: 'El nombre de la sucursal es obligatorio' })
  @IsString({
    message: 'El nombre de la sucursal debe ser una cadena de texto',
  })
  readonly nombre_sucursal: string;

  @ApiPropertyOptional({
    description: 'Nombre del encargado de la sucursal',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString({ message: 'El encargado debe ser una cadena de texto' })
  readonly encargado?: string;

  @ApiPropertyOptional({
    description: 'Dirección de la sucursal',
    example: 'Jr. Los Pinos 456',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  readonly direccion?: string;

  @ApiPropertyOptional({
    description: 'Indica si es la sucursal principal',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_principal debe ser un valor booleano' })
  readonly is_principal?: boolean = true;
}

// Body de POST /clientes
export class CreateClienteRequestDto implements CreateClienteCommand {
  @ApiProperty({
    description: 'Paso 1: datos de la empresa',
    type: DatosEmpresaDto,
  })
  @IsNotEmptyObject({}, { message: 'Los datos de la empresa son obligatorios' })
  @ValidateNested()
  @Type(() => DatosEmpresaDto)
  readonly datos_empresa: DatosEmpresaDto;

  @ApiProperty({
    description: 'Paso 2: persona responsable de la empresa',
    type: ResponsableDto,
  })
  @IsNotEmptyObject({}, { message: 'El responsable es obligatorio' })
  @ValidateNested()
  @Type(() => ResponsableDto)
  readonly responsable: ResponsableDto;

  @ApiProperty({
    description: 'Paso 3: sucursal principal de la empresa',
    type: SucursalPrincipalDto,
  })
  @IsNotEmptyObject({}, { message: 'La sucursal principal es obligatoria' })
  @ValidateNested()
  @Type(() => SucursalPrincipalDto)
  readonly sucursal_principal: SucursalPrincipalDto;
}
