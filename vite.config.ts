/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` debe coincidir con el nombre del repositorio para GitHub Pages:
// https://juancruz0103.github.io/persona-guide-room/
export default defineConfig({
  base: '/persona-guide-room/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
