/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En Cloudflare (Pages: CF_PAGES=1, Workers: WORKERS_CI=1) el sitio vive en la raíz del dominio.
// En GitHub Pages `base` debe coincidir con el nombre del repositorio:
// https://juancruz0103.github.io/persona-guide-room/
export default defineConfig({
  base: process.env.CF_PAGES || process.env.WORKERS_CI ? '/' : '/persona-guide-room/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
