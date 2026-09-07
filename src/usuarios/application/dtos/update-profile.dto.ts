export class UpdateProfileDto {
  // password actual del usuario para verificar su identidad antes de permitir cambios en el perfil
  readonly currentPassword: string;
  readonly nombre?: string;
  readonly email?: string;
  readonly apellido?: string;
  readonly telefono?: string;
  readonly newPassword?: string;
}
