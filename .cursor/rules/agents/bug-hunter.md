# Bug Hunter Rules (NestJS Template)

The goal of this agent is to quickly spot **likely bugs** and
**dangerous edge cases** in the NestJS template, not to enforce
architecture or style.

## High‑Risk Areas

### Prisma and Database Access

- Look for Prisma operations (`create`, `update`, `delete`, `upsert`) that:
  - Swallow or ignore errors instead of throwing.
  - Do not translate known Prisma error codes (`P2002`, `P2025`) into HTTP
    exceptions.
- Look for multi‑step flows that should probably be wrapped in a transaction
  (multiple related writes where partial success is dangerous).
- Look for missing `await` on Prisma calls that can lead to unhandled
  promise rejections.

### HTTP Controllers and DTOs

- Look for controller methods that:
  - Do not use DTOs for request bodies or responses.
  - Do not validate route parameters (e.g. missing `ParseUUIDPipe` for IDs).
  - Return raw entities or Prisma models where a DTO is expected.
- Look for inconsistencies between Swagger decorators and actual return types
  (e.g. `@ApiOkResponse({ type: UserDto })` but returning something else).

### Error Handling and Filters

- Look for places that:
  - Catch errors and then return plain objects instead of throwing
    `HttpException` subclasses.
  - Re‑throw non‑HTTP errors without mapping them, causing unexpected
    500 responses where a more specific error is appropriate.
- Look for code that may break `HttpExceptionFilter` assumptions, especially
  around `ZodSerializationException` and `ZodError` handling.

### Configuration and Environment

- Look for new configuration keys:
  - Used via `process.env` but not added to `ConfigSchema`.
  - Added to `ConfigSchema` but never used.
- Look for places where default values are assumed in code instead of being
  modeled in the Zod schema.

### Logging and Observability

- Look for:
  - Direct `console.log`/`console.error` usage instead of NestJS logging.
  - Logging of sensitive data (passwords, tokens, raw headers).
  - Excessive noisy logging in hot paths without environment guards.

### Async and Lifecycle

- Look for:
  - Missing `await` on async NestJS lifecycle methods.
  - Long‑running operations in request handlers without timeouts or clear
    failure modes.
  - Resources that are created but never cleaned up on shutdown (except those
    explicitly managed by NestJS/Prisma integration).

## Detection Patterns

- Search for `process.env` usage outside of the config module and flag it.
- Search for `try`/`catch` blocks that:
  - Swallow errors silently.
  - Log errors but do not re‑throw or convert them into HTTP exceptions.
- Search for controller methods that:
  - Use `any` in their signatures.
  - Lack DTO types or return plain objects without guarantees.
- Search for Prisma usage without error handling in write operations and
  highlight potential issues.

