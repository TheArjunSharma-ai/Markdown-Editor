import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'MarkdownEditor',
      formats: ['es', 'iife'],
      fileName: (format) => format === 'es' ? 'markdown-editor.es.js' : 'markdown-editor.js',
      cssFileName: 'markdown-editor',
    },
  },
});
