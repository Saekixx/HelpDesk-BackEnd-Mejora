export interface UpdateProfileDto {
  currentPassword: string; // password actual del usuario para verificar su identidad antes de permitir cambios en el perfil
  nombre?: string;
  email?: string;
  apellido?: string;
  telefono?: string;
  newPassword?: string;
}
