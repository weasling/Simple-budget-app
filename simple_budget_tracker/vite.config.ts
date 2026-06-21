import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/analytics': {
        target: 'https://williamtf92xy.lastapp.dev',
        changeOrigin: true,
        secure: true,
      },
      '/api': {
        target: 'https://williamtf92xy.lastapp.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});