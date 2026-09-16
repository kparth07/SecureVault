import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'argon2-browser': path.resolve(__dirname, 'node_modules/argon2-browser/dist/argon2-bundled.min.js'),
    },
  },
  optimizeDeps: {
    include: ['argon2-browser'],
  },
});


