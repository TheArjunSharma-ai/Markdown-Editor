import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve('demo'),
  base: './',
  build: {
    outDir: resolve('pages'),
    emptyOutDir: true,
  },
});
