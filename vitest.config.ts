import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reportsDirectory: 'coverage',
      reporter: ['text', 'html'],
    },
  },
});
