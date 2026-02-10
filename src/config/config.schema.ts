import z from 'zod';

export const ConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_NAME: z.string(),
  APP_VERSION: z.string(),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url(),
  OTLP_TRACE_EXPORTER_URL: z.url(),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
});

export type Config = z.infer<typeof ConfigSchema>;
