import { plainToInstance } from 'class-transformer';
import {
  registerDecorator,
  validate,
  ValidationArguments,
  ValidationError,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UpdateSucursalEncargadoDto } from '../dtos/update-sucursal-encargado.dto';

// Largo máximo del encargado en texto plano: nombre (50) + espacio + apellido
// (50), que son los límites de `usuarios.nombre` y `usuarios.apellido` en el
// schema de Prisma. El texto se separa en esos dos campos al persistir.
export const ENCARGADO_TEXTO_MAX_LENGTH = 101;

const MENSAJE_VACIO = 'El nombre del encargado no puede estar vacío';
const MENSAJE_LARGO = `El nombre completo del encargado no puede superar los ${ENCARGADO_TEXTO_MAX_LENGTH} caracteres`;
const MENSAJE_TIPO =
  'El encargado debe ser un texto con el nombre completo o un objeto con los datos del encargado';

// Convierte el objeto anidado en una instancia de UpdateSucursalEncargadoDto
// (con la misma conversión implícita de tipos que aplica el ValidationPipe
// global) para poder validarlo. Un string, null, un array o cualquier otro valor
// se devuelve igual y lo rechaza el validador. Se usa con @Transform.
export function toEncargadoInput(value: unknown): unknown {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }
  return plainToInstance(UpdateSucursalEncargadoDto, value, {
    enableImplicitConversion: true,
  });
}

// `encargado` acepta dos formas:
// - string: nombre completo en texto plano, no vacío y de hasta 101 caracteres.
// - objeto: se validan sus campos con las reglas de UpdateSucursalEncargadoDto
//   y no se permiten propiedades desconocidas (igual que el ValidationPipe).
// @ValidateNested no sirve aquí porque rechaza los valores que no son objetos.
@ValidatorConstraint({ name: 'isEncargadoInput', async: true })
export class IsEncargadoInputConstraint
  implements ValidatorConstraintInterface
{
  // Errores de la validación anidada, indexados por el objeto validado para
  // poder armar el mensaje sin compartir estado entre peticiones concurrentes.
  private readonly erroresAnidados = new WeakMap<object, string[]>();

  async validate(value: unknown): Promise<boolean> {
    if (typeof value === 'string') {
      const texto = value.trim();
      return texto.length > 0 && texto.length <= ENCARGADO_TEXTO_MAX_LENGTH;
    }

    if (value instanceof UpdateSucursalEncargadoDto) {
      const errores = await validate(value, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      if (errores.length === 0) return true;
      this.erroresAnidados.set(value, this.aplanar(errores));
    }
    return false;
  }

  defaultMessage(args: ValidationArguments): string {
    const { value } = args;
    if (typeof value === 'string') {
      return value.trim().length === 0 ? MENSAJE_VACIO : MENSAJE_LARGO;
    }
    if (value instanceof UpdateSucursalEncargadoDto) {
      const errores = this.erroresAnidados.get(value);
      if (errores?.length) return errores.join('; ');
    }
    return MENSAJE_TIPO;
  }

  private aplanar(errores: ValidationError[]): string[] {
    return errores.flatMap((error) => [
      ...Object.values(error.constraints ?? {}),
      ...this.aplanar(error.children ?? []),
    ]);
  }
}

export function IsEncargadoInput(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsEncargadoInputConstraint,
    });
  };
}
