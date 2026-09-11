import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    open: false,
    host: true,
    allowedHosts: true,
    cors: true,
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: true,
    cors: true,
  },
});
