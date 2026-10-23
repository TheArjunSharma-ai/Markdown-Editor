import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: { statements: 90, lines: 90, functions: 90, branches: 85 },
    },
  },
});
