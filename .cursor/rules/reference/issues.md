# Known Architectural Compromises (NestJS Template)

These items describe **intentional trade-offs** and **known limitations**
of the current NestJS + Fastify + Prisma template. They are **not**
necessarily bugs; treat them as constraints unless the task explicitly says
to change them.

## 1. Prisma Transactions and Consistency

- **Issue**: Service methods that call Prisma (for example in `UserService`)
  do not use explicit database transactions.
- **Rationale**: Current flows are simple (single-table writes) and do not
  require cross-aggregate consistency.
- **Impact**: If future features perform multiple related writes, there is
  a risk of partial updates when an error occurs mid‑flow.
- **Status**: Acceptable for the current demo scope. When adding
  multi-step write flows, prefer Prisma `$transaction` and document the
  behavior.

## 2. Generic HTTP Error Payloads

- **Issue**: Domain‑specific exceptions are mostly mapped to standard NestJS
  HTTP exceptions (`NotFoundException`, `ConflictException`) with default
  error bodies.
- **Rationale**: Keeps the API surface small and avoids premature
  standardisation of error codes.
- **Impact**: Clients cannot easily distinguish detailed error categories
  beyond HTTP status; error payloads are not yet versioned or strongly
  typed.
- **Status**: Acceptable for an internal template. When the API becomes
  public, introduce a shared error response contract (code, message,
  details) and update controllers accordingly.

## 3. DTO ↔ Persistence Shape Coupling

- **Issue**: User DTOs (`UserDto`, `CreateUserDto`, `UpdateUserDto`) closely
  mirror the Prisma `User` model.
- **Rationale**: Reduces boilerplate for a simple example module and keeps
  the template easy to read.
- **Impact**: Changes in the Prisma model can directly leak into the HTTP
  contract; it is harder to evolve the persistence schema independently
  from the API.
- **Status**: Acceptable for this template. For real products, introduce
  explicit mapping between Prisma models and DTOs.

## 4. Limited Domain Layer Abstraction

- **Issue**: The template uses NestJS services (`UserService`) directly on
  top of Prisma instead of a separate domain/use‑case layer.
- **Rationale**: Keeps the example small and focused on infrastructure
  patterns (config, logging, observability).
- **Impact**: Harder to extract pure domain logic or reuse it across
  transports (e.g. CLI, queues) without refactoring.
- **Status**: Acceptable for now. When business logic grows, introduce an
  explicit application/domain layer and keep services thin.

## 5. Observability Coverage

- **Issue**: OpenTelemetry and Prometheus are wired at the application
  level, but not all modules emit explicit domain‑level metrics or spans.
- **Rationale**: Template focuses on providing the plumbing; detailed
  instrumentation is left to consumers.
- **Impact**: Out of the box, traces/metrics are useful for infrastructure
  behavior but not for business KPIs.
- **Status**: Acceptable for a starter template. New features should add
  meaningful spans and metrics where appropriate.

## 6. Validation and Serialization Strategy

- **Issue**: Validation and serialization are implemented via `nestjs-zod`
  with global `ZodValidationPipe` and `ZodSerializerInterceptor`.
- **Rationale**: Ensures strong runtime validation from a single source of
  truth (Zod schemas).
- **Impact**: All DTOs must be built around Zod schemas; using plain
  TypeScript classes or `class-validator`/`class-transformer` is not
  supported without additional work.
- **Status**: Intentional design choice. When introducing new DTOs,
  continue using Zod-based DTOs for consistency.

## 7. Prisma Client Lifecycle

- **Issue**: `PrismaService` extends `PrismaClient` directly and hooks into
  NestJS lifecycle (`OnApplicationBootstrap`, `OnApplicationShutdown`) with
  a TODO around generics for query logging.
- **Rationale**: Standard NestJS + Prisma integration pattern with minimal
  abstraction.
- **Impact**: Logging type is slightly awkward; there is a small risk of
  misuse if `$on('query')` is changed incorrectly.
- **Status**: Known limitation. Acceptable until Prisma/Nest integration
  is refactored or wrapped further.
