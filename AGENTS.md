# AGENTS.md

## Orientación

- `README.md` es texto genérico de NestJS; ignóralo para convenciones del proyecto. `package.json` y las configs raíz son la fuente de verdad.
- Entradas: `src/main.ts` → `src/app.module.ts`. Swagger UI en `/docs`. El `ValidationPipe` global hace whitelist de DTOs, rechaza campos extra y convierte implícitamente los query params.
- La documentación de pruebas unitarias vive en `docs/unit-testing.md`; no mezclar sus reglas aquí.

## Arquitectura y capas

- Los módulos de dominio viven en `src/<dominio>/{domain,application,infrastructure}`. Los controladores llaman casos de uso; los casos de uso inyectan tokens `*_REPOSITORY` exportados desde `domain/ports/*`; los módulos enlazan esos tokens a `*prisma.repository.ts`. Usa el alias `@/` para importar desde `src/*`.
- `CommonModule` es `@Global()`: aporta `PrismaService`, el filtro global de excepciones y `ResponseInterceptor`.
- `ChatModule` ↔ `TicketModule`, `AuthModule` ↔ `UsuariosModule` y `TicketModule` ↔ `CitasModule` son ciclos intencionales con `forwardRef()`; consérvalo al agregar imports cruzados.
- Redis se inyecta con el token string `'REDIS_CLIENT'` desde el `RedisModule` global.

## Dominio y alcance

- Roles del sistema: `ADMINISTRADOR`, `SOPORTE_TECNICO`, `SOPORTE_INSITU`, `CLIENTE_EMPRESA`, `CLIENTE_SUCURSAL`, `CLIENTE_TRABAJADOR`. No existe rol `cliente_area`; la división por áreas de sucursal la maneja la sucursal.
- Alcance: sistema orientado a clientes externos (empresas, sucursales, trabajadores). No hay flujo actual de venta de hardware/software, cotizaciones ni pagos. El futuro reemplazo de piezas/cotización no está implementado aún.
- Regla crítica al derivar un ticket a insitu: el caso de uso selecciona el `soporte_remoto` más óptimo y la franja horaria. Si es de la misma sucursal, la franja admite hasta máximo 3 tickets para agrupar citas; si es de otra sucursal y la franja ya está ocupada, ya no está disponible. No relajar el límite de 3 ni reutilizar franjas ocupadas por otra sucursal.

## Guards, roles, respuestas y errores

- Endpoints protegidos con `JwtAuthGuard` y `RoleGuard`, usando el decorador de rol `@Roles(...)` (también denominado `@role`). No inventes roles fuera de los seis listados.
- Los controladores devuelven la estructura `{ status, message, data }` (el `ResponseInterceptor` global garantiza ese sobre; normalmente el controlador entrega `{ message, data }` y el interceptor agrega `status`).
- Se usan `DomainException` / excepciones de negocio o caso de uso junto con excepciones nativas de NestJS (`NotFoundException`, `BadRequestException`, etc.). El filtro global las convierte a `{ status, message, data: null }`.

## Datos y entorno

- Runtime necesita MySQL vía `DATABASE_URL`, MongoDB vía `MONGO_URI` y Redis vía `REDIS_HOST` / `REDIS_PORT`. `docker compose up -d` levanta solo MongoDB y Redis; MySQL se espera en `localhost:3306` fuera de Compose.
- `.env` está ignorado por Git pero poblado localmente con credenciales SMTP, JWT y DB; no lo commitees ni lo imprimas.
- Para una DB nueva aplica `npx prisma migrate deploy`; tras cambios de schema usa `npx prisma migrate dev` y `npx prisma generate`. El hook `postinstall` es `prisma skills sync || exit 0`; `prisma skills` no es un comando válido de Prisma, por lo que falla silenciosamente y no genera el cliente.
- `datosdeprueba.sql` hace TRUNCATE de todas las tablas antes de insertar datos semilla, y no hay script npm de seed. Ejecútalo manualmente solo al reiniciar intencionalmente la BD local.

## Comandos generales

- `npm run start:dev`, `npm run build`, `npm run start:prod`.
- `npm run lint` (oxlint; actualmente solo warnings, exit 0). No hay script de typecheck: usa `npx tsc --noEmit -p tsconfig.json` (actualmente limpio). `npm run format` solo formatea `src/` y `test/`.
- `npm run test:e2e` usa `vitest.config.e2e.ts`; hoy no es baseline verde: la única spec es una plantilla Nest obsoleta (`GET /` → `"Hello World!"`, ruta inexistente) y hace timeout sin Redis/Mongo/MySQL activos.
- Comandos y reglas de pruebas unitarias: ver `docs/unit-testing.md`.
