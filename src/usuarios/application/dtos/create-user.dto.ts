export class CreateUserDto {
  readonly nombre: string;
  readonly apellido: string;
  readonly correo: string;
  readonly password: string;
  readonly telefono: string;
  readonly id_rol: number;
  readonly id_cliente?: number;
  readonly id_sucursal?: number;
  readonly id_area?: number;
}
