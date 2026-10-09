import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: './preview',
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react-select': path.resolve(__dirname, './node_modules/react-select'),
    },
  },
  server: {
    port: 3016,
    open: false,
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    },
  },
});
