// src/auth/infrastructure/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

// Definimos una constante para la clave de metadatos que se utilizará
// para almacenar los roles requeridos en los controladores o métodos.

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
