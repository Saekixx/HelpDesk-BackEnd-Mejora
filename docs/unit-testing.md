# Pruebas unitarias (Vitest)

## Ubicación obligatoria

- Todas las pruebas unitarias deben crearse dentro de la carpeta `test/`, organizadas por módulo: `test/<modulo>/...` (por ejemplo `test/auth/...`, `test/usuarios/...`, `test/clientes/...`).
- No crear specs unitarias junto al código en `src/`.

## Flujo obligatorio antes de crear pruebas

- Siempre solicitar y confirmar con el usuario qué **módulo terminado** se va a probar y qué **endpoints** se cubrirán, antes de crear cualquier archivo de prueba unitaria. No asumir el módulo ni generar specs sin esa confirmación.
- Cubrir únicamente módulos terminados.
- Por cada endpoint acordado, cubrir: caso feliz, validación / `JwtAuthGuard` / `RoleGuard` / `@Roles`, excepciones de dominio (`DomainException` y derivadas) y de NestJS, y casos borde.

## Aislamiento y límites

- Nunca tocar base de datos real (MySQL vía Prisma, MongoDB/Mongoose), Redis ni servicios externos (SMTP, APIs). Usar siempre datos y dependencias mockeados: tokens `*_REPOSITORY`, `PrismaService`, `'REDIS_CLIENT'`, `MailerService`, etc.
- Al crear pruebas unitarias, **solo lectura** del código existente: NO modificar archivos de aplicación, dominio ni infraestructura. Crear únicamente nuevos archivos de prueba en `test/<modulo>/`.
- Verificar el contrato de respuesta `{ status, message, data }` y de error `{ status, message, data: null }` sin depender del filtro/interceptor reales: mockear las dependencias y afirmar el resultado.

## Configuración y ejecución

- Configuración: `vitest.config.ts` (globals, entorno `node`, include `test/**/*.spec.ts` y `test/**/*.test.ts`, alias `@` → `src`).
- Estado actual: no hay specs unitarias en `test/`; `npm test` falla con `No test files found`.
- Comando puntual:

```bash
npx vitest run test/<modulo>/<archivo>.spec.ts
```
