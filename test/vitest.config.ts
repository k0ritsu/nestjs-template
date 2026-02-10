import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

process.loadEnvFile();

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    root: '.',
  },
  plugins: [
    swc.vite({
      module: {
        type: 'es6',
      },
    }),
  ],
});
