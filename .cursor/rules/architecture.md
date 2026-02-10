# Architecture Rules (NestJS Template)

These rules describe the **high‑level architecture** of this NestJS template
and how new code should be structured.

## Layering and Module Structure

### Core Application

- The root `AppModule` is responsible for:
  - Wiring global infrastructure modules (`ConfigModule`, `LoggerModule`,
    `PrometheusModule`).
  - Registering global pipes, interceptors and filters via `APP_PIPE`,
    `APP_INTERCEPTOR`, `APP_FILTER`.
  - Importing feature modules (`AuthModule`, `HealthcheckModule`, `UserModule`,
    etc.).
- The application entry point `main.ts` MUST:
  - Create a `NestFastifyApplication` with `FastifyAdapter`.
  - Configure Swagger with `SwaggerModule` and `DocumentBuilder`.
  - Configure global prefix, versioning and shutdown hooks.

### Feature Modules

- Each domain area (e.g. **user**, **auth**, **healthcheck**) MUST be organised
  into its own NestJS module under `src/modules/<feature>`.
- A feature module typically contains:
  - `<feature>.module.ts` — Nest `@Module` definition.
  - `<feature>.controller.ts` — HTTP controllers for this feature.
  - `<feature>.service.ts` — business/application logic for this feature.
  - `dto/` — DTOs and Zod schemas for requests and responses.
- Feature modules MUST be imported into `AppModule` and SHOULD avoid depending
  on each other directly unless there is a clear ownership relationship.

### Shared Infrastructure

- Cross‑cutting infrastructure MUST live under `src/modules/shared` and
  `src/config`:
  - `modules/shared/prisma` — Prisma module and service.
  - `modules/shared/http` — HTTP filters and other HTTP‑specific helpers.
  - `config` — configuration schema, service and module.
- Shared modules (e.g. `PrismaModule`) MUST be imported by feature modules that
  need the corresponding functionality.

## Dependency Direction

- Dependency flow MUST always go:
  - from **feature modules** to **shared infrastructure** and **config**,
  - from **controllers** to **services**, and
  - from **services** to **PrismaService** and other infrastructure services.
- Controllers MUST NOT depend directly on Prisma clients or other low‑level
  infrastructure; they MUST call services instead.
- Services MUST NOT depend on controllers.
- Configuration MUST be consumed via `ConfigService` and NOT via direct
  access to `process.env`.

## HTTP API Design and Versioning

- HTTP controllers MUST:
  - Be annotated with `@Controller` using a resource path (e.g. `users`).
  - Specify a string `version` (e.g. `'1'`) for URI‑based versioning.
  - Use DTOs both for input (body, params) and output.
- Global HTTP settings MUST be configured in `main.ts`:
  - Global prefix `api`.
  - Versioning type `VersioningType.URI`.
  - Swagger endpoint path `swagger`.
- New API versions SHOULD be implemented by:
  - Adding new controllers with a different `version` string, or
  - Introducing separate modules if the surface diverges significantly.

## Persistence and Prisma

- `PrismaService` MUST be the single entry point for database access.
- `PrismaService`:
  - Extends `PrismaClient` with a `PrismaPg` adapter configured from
    `ConfigService`.
  - Implements `OnApplicationBootstrap` and `OnApplicationShutdown` to
    connect and disconnect.
  - Registers query logging in development environments.
- Feature services (e.g. `UserService`) MUST:
  - Inject `PrismaService` via the constructor.
  - Use Prisma's type‑safe client API for all read/write operations.
  - Translate known `PrismaClientKnownRequestError` codes into NestJS HTTP
    exceptions.

## Validation and DTOs

- Validation and serialization MUST be based on Zod schemas via `nestjs-zod`:
  - Zod schemas define the shape and validation rules.
  - DTO classes are derived using `createZodDto`.
- `AppModule` MUST configure `ZodValidationPipe` as a global pipe and
  `ZodSerializerInterceptor` as a global interceptor.
- Controllers MUST:
  - Accept DTOs as parameters (`@Body() dto: CreateUserDto`).
  - Return DTOs as method return types (`Promise<UserDto>`).

## Observability

- **Logging**
  - `LoggerModule` from `nestjs-pino` MUST be configured in `AppModule` using
    `ConfigService` for log level and pretty printing in development.
  - Application logs SHOULD use the injected `Logger` or the Nest
    `Logger` class.
- **Metrics**
  - `PrometheusModule` SHOULD be used to expose metrics; the default
    configuration is registered in `AppModule`.
- **Tracing**
  - OpenTelemetry setup in `otel-setup.ts` MUST be executed before Nest
    bootstraps (imported at the top of `main.ts`).
  - New features SHOULD add semantic spans and attributes where appropriate.

## Error Handling

- Global HTTP error handling MUST be implemented via `HttpExceptionFilter`
  registered as `APP_FILTER`.
- `HttpExceptionFilter`:
  - Handles `ZodSerializationException` and logs underlying `ZodError`
    details for debugging.
  - Delegates to the base `BaseExceptionFilter` for standard behavior.
- Services MUST throw NestJS exceptions instead of manually building
  response objects.

