# Code Reviewer Rules (NestJS Template)

These rules guide code review for this NestJS + Fastify + Prisma + Zod
template. Focus on **consistency with existing patterns** and **simple,
testable code**.

## Architecture Compliance

- Verify new features are implemented as NestJS modules under `src/modules`
  with clear boundaries (module, controller, service, DTOs).
- Verify controllers depend on services only and do NOT access `PrismaService`
  or other low‑level infrastructure directly.
- Verify services depend on `PrismaService` and other shared infrastructure
  via constructor injection.
- Verify configuration is accessed exclusively via `ConfigService`, not
  directly from `process.env`.
- Verify shared infrastructure is added under `modules/shared` or `config`
  and re‑used across features.

## Versioning and Routing

- Verify controllers use `@Controller` with:
  - `path` that matches the HTTP resource (e.g. `users`).
  - `version` string compatible with the global URI versioning.
- Verify route handlers use appropriate HTTP verbs (`@Get`, `@Post`,
  `@Patch`, `@Delete`) and meaningful, REST‑like paths.
- Verify parameters are validated and parsed using Nest pipes where
  appropriate (e.g. `ParseUUIDPipe` for UUID IDs).

## Error Handling

- Verify services translate persistence errors (e.g. Prisma `P2002`, `P2025`)
  into meaningful NestJS HTTP exceptions.
- Verify controllers do not manually build error response bodies; they should
  rely on thrown exceptions and global filters.
- Verify no raw `console.log`/`console.error` calls for errors; use NestJS
  logging mechanisms instead.
- Verify newly introduced exceptions integrate well with
  `HttpExceptionFilter` and do not break existing error handling behavior.

## Validation and DTOs

- Verify request DTOs and response DTOs:
  - Are defined using Zod schemas and `createZodDto`.
  - Live in the module’s `dto/` directory.
  - Represent the external API contract, not necessarily the exact database
    schema.
- Verify controllers:
  - Accept DTOs as method parameters (`@Body() dto: CreateXDto`).
  - Return DTOs as result types (`Promise<XDto>` or arrays of DTOs).
  - Use `@SerializeOptions({ type: XDto })` where necessary.
- Verify the use of Zod schemas is consistent with global
  `ZodValidationPipe` and `ZodSerializerInterceptor`.

## Logging and Observability

- Verify new services or infrastructure components use `Logger` or the
  configured `nestjs-pino` logger where appropriate.
- Verify log messages are concise, informative and do not leak sensitive data.
- Verify noisy debug logging (especially around Prisma queries) is gated by
  environment (e.g. development only).

## Configuration

- Verify new configuration values:
  - Are added to `ConfigSchema` with appropriate Zod types.
  - Have sensible defaults when appropriate.
  - Are accessed only through `ConfigService`.
- Verify removal or change of existing config keys is reflected consistently
  across `ConfigSchema`, `.env.example` and usage sites.

## Testing

- Verify new services and controllers have corresponding unit tests where
  logic is non‑trivial.
- Verify tests for HTTP behavior use the preferred test runner (`vitest`) and
  follow the existing patterns from current test files.
- Verify tests avoid hitting real external services or databases whenever
  practical; use Prisma test setups or mocks instead.

