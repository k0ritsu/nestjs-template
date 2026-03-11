import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts', 'src/otel-setup.ts'],
  splitting: false,
  clean: true,
  sourcemap: true,
  format: 'esm',
});
