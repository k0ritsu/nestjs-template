# Code Style Rules (NestJS Template)

These rules describe the **preferred coding style** for this NestJS +
Fastify + Prisma + Zod template.

## Naming Conventions

- **Modules**
  - Module files MUST be named `<feature>.module.ts` (e.g. `user.module.ts`).
  - Module classes MUST be named `<Feature>Module` (e.g. `UserModule`).
- **Controllers**
  - Controller files MUST be named `<feature>.controller.ts`.
  - Controller classes MUST be named `<Feature>Controller`.
  - Routes SHOULD use plural nouns for collections (e.g. `users`).
- **Services**
  - Service files MUST be named `<feature>.service.ts`.
  - Service classes MUST be named `<Feature>Service`.
- **DTOs and Schemas**
  - DTO files MUST live in a `dto/` subdirectory of their module.
  - Zod schemas MUST be named `<Name>Schema` (e.g. `UserSchema`).
  - DTO classes generated from Zod MUST be named `<Name>Dto`
    (e.g. `CreateUserDto`, `UserDto`, `UpdateUserDto`).
- **Configuration**
  - Config schema MUST be named `ConfigSchema`.
  - Inferred config type MUST be named `Config`.

## Error Handling

- Services MUST throw NestJS HTTP exceptions (`NotFoundException`,
  `ConflictException`, etc.) for domain‑level failures visible to clients.
- Prisma errors MUST be translated to domain‑appropriate HTTP exceptions
  (for example, `P2002` → `ConflictException`, `P2025` → `NotFoundException`).
- Non‑handled errors SHOULD be re‑thrown to be processed by global filters and
  NestJS default handling.
- Controllers SHOULD be thin and generally avoid `try/catch`; error mapping
  belongs in services or global filters.

## Logging

- Application logging MUST use `nestjs-pino` through the global `LoggerModule`
  configuration in `AppModule`.
- Feature services MAY use `Logger` from `@nestjs/common` when local logging is
  needed; logger instances MUST be created with the class name
  (e.g. `new Logger(PrismaService.name)`).
- Logs SHOULD be structured and concise; avoid logging entire DTOs with
  sensitive data.
- For Prisma query logging, prefer the existing `$on('query')` integration in
  `PrismaService` instead of ad‑hoc logging.

## Validation and Serialization

- DTOs MUST be declared using `nestjs-zod`:
  - Define a Zod schema (e.g. `UserSchema`).
  - Create a DTO class via `createZodDto(UserSchema)`.
- Global validation MUST be handled by `ZodValidationPipe` registered as
  `APP_PIPE` in `AppModule`.
- Global serialization MUST be handled by `ZodSerializerInterceptor` registered
  as `APP_INTERCEPTOR`.
- Controllers that return DTOs SHOULD use `@SerializeOptions({ type: UserDto })`
  to ensure proper serialization shape.

## Request/Response Structures

- Each HTTP endpoint MUST use explicit DTOs for request and response bodies;
  do NOT expose raw Prisma models.
- Request DTOs MUST validate only the data that comes from the client
  (e.g. `CreateUserDto`, `UpdateUserDto`).
- Response DTOs SHOULD represent external API contracts
  (e.g. `UserDto` with `id` and `username`).
- DTOs MUST be annotated for Swagger using NestJS Swagger decorators
  on controller methods (`@ApiOkResponse`, `@ApiCreatedResponse`, etc.).

## Controller Structure

- Controllers MUST be decorated with `@Controller` using:
  - a `path` matching the resource name (e.g. `users`), and
  - a string `version` (e.g. `'1'`) to work with URI versioning.
- Controllers MUST inject their corresponding service via the constructor using
  `private readonly` properties.
- Controller methods:
  - MUST be `async`.
  - MUST declare explicit return types using DTOs (e.g. `Promise<UserDto[]>`).
  - MUST use NestJS route decorators (`@Get`, `@Post`, `@Patch`, `@Delete`).
  - SHOULD use `ParseUUIDPipe` or other built‑in pipes for parameter parsing.

## Data Access and Prisma Usage

- Direct database access MUST go through `PrismaService`.
- `PrismaService` MUST be provided by a shared `PrismaModule` imported into
  feature modules that need database access.
- Services MUST use Prisma's generated client methods (`findMany`, `findUnique`,
  `create`, `update`, `delete`, etc.) and SHOULD keep Prisma queries simple and
  readable.
- When catching `PrismaClientKnownRequestError`, services MUST translate known
  codes into appropriate NestJS HTTP exceptions and re‑throw unknown errors.

## Configuration

- All configuration MUST come from environment variables and be validated
  through the `ConfigSchema` (Zod) defined in `src/config`.
- `ConfigService` MUST be the single abstraction used by the rest of the app
  to read configuration values.
- Configuration MUST NOT be read directly from `process.env` outside of the
  config module.
- Port, app name, version, log level, database URL and OTLP exporter URL MUST
  all be provided through the config module.

## Imports and Module Boundaries

- Feature modules MUST import only what they use (e.g. `UserModule` imports
  `PrismaModule` and any other shared modules it needs).
- Circular dependencies between modules MUST be avoided.
- Shared infrastructure pieces (Prisma, HTTP filters, config) MUST live in
  dedicated `modules/shared` or `config` folders and be re‑used across
  features.
- Imports MUST prefer relative paths within the module and root‑relative paths
  only when referencing shared modules or config.

## Comments and Documentation

- Public classes (modules, controllers, services) SHOULD have short comments
  describing their responsibility when it is not obvious from the name.
- Complex logic inside services SHOULD be documented with brief comments
  explaining *why* (not *what*) something is done.
- Swagger decorators SHOULD be used consistently to keep the API surface
  discoverable via `/swagger`.

