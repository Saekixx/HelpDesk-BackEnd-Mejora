# CI con GitHub Actions

Este documento explica la configuración de Integración Continua definida en [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Qué se configuró

Se añadió un workflow llamado **CI** con un único job, `verify`, que se ejecuta en `ubuntu-latest`. El job valida que el proyecto compile, pase la verificación de tipos y pase todas las pruebas unitarias aisladas, sin depender de servicios externos ni de secretos.

## Triggers

El workflow se dispara automáticamente cuando:

- Se hace `push` a las ramas `main` o `develop`.
- Se abre, actualiza o reabre un `pull_request` cuyo destino es `main` o `develop`.

No se configuró `master` porque no existe como rama local ni remota en este repositorio. Las ramas de trabajo (`giovanni`, `leandro`, `alvaro`, etc.) disparan el workflow al abrir un PR hacia `main` o `develop`, no con pushes directos.

Además, se habilitó `concurrency` con `cancel-in-progress: true`: si llega un nuevo push o PR para la misma referencia, se cancela la ejecución anterior de ese mismo `github.ref` para ahorrar minutos de Actions.

## Permisos

El workflow solicita únicamente `permissions: contents: read`, suficiente para hacer checkout del código. No necesita permisos de escritura ni secrets.

## Job `verify`

Pasos, en orden:

1. **Checkout del repositorio** — `actions/checkout@v4` descarga el código fuente.
2. **Configurar Node.js y caché de npm** — `actions/setup-node@v4` instala Node 22 y habilita la caché de npm usando `package-lock.json` como fuente.
3. **Instalar dependencias limpias** — `npm ci` instala exactamente las versiones bloqueadas en `package-lock.json` (lockfile v3).
4. **Generar cliente Prisma** — `npx prisma generate` genera el cliente a partir de `prisma/schema.prisma`. Solo lee el schema: **no se conecta a MySQL** y no requiere `DATABASE_URL`.
5. **Verificación estática de tipos** — `npx tsc --noEmit -p tsconfig.json`.
6. **Pruebas unitarias aisladas** — `npx vitest run` ejecuta todos los `test/**/*.spec.ts` y `test/**/*.test.ts` definidos en `vitest.config.ts`.
7. **Compilación de producción** — `npm run build` ejecuta `nest build`.

El `postinstall` de `package.json` (`prisma skills sync || exit 0`) falla silenciosamente por diseño, por lo que no bloquea `npm ci`. La generación real del cliente la hace el paso explícito `npx prisma generate`.

## No se necesitan secretos ni servicios

El workflow no define `env`, `secrets` ni `services`. Las pruebas unitarias mockean Prisma, Redis, SMTP y cualquier otro colaborador externo, por lo que no se requieren:

- MySQL en `localhost:3306`.
- MongoDB ni Redis vía Docker.
- `DATABASE_URL`, `MONGO_URI`, `REDIS_HOST`, `REDIS_PORT` ni credenciales SMTP/JWT.
- El archivo `.env`.

## Cómo verificarlo en GitHub

1. Sube el workflow a la rama `main` o `develop`, o abre un PR hacia una de ellas.
2. En el repositorio de GitHub, entra a la pestaña **Actions**.
3. En la lista de workflows, selecciona **CI**.
4. Abre la ejecución correspondiente al push o al PR.
5. Dentro del job `verify`, revisa cada step. Si todos terminan en verde, la integración continua pasó.
6. Si falla algún step, haz clic en él para ver los logs y reproducirlo localmente con los mismos comandos.

## Reproducción local

Puedes ejecutar exactamente la misma secuencia en tu máquina:

```bash
npm ci
npx prisma generate
npx tsc --noEmit -p tsconfig.json
npx vitest run
npm run build
```

Si todo pasa localmente, el job de GitHub Actions debería pasar con el mismo lockfile y la misma versión de Node.
