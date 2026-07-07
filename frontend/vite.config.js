import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Backend target for the dev-server proxy. Override with:
//   VITE_API_PROXY_TARGET=http://localhost:8000 npm run dev
const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000';
const BASE_PATH = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base: BASE_PATH,
  plugins: [react()],
  server: {
    port: 5173,
    watch: {
      ignored: ['**/public/**'],
    },
    proxy: {
      // Frontend code calls relative paths like `/api/v1/services`.
      // In dev, Vite forwards those to the FastAPI backend below, so no
      // CORS configuration is needed. In production, point your reverse
      // proxy (nginx, etc.) at the backend the same way -- see README.
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
      },
      '/uploads': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
  },
});
