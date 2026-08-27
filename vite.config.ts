import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/',
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: false,
    open: '/index.html',
    fs: {
      allow: ['.'],
    },
    watch: {
      usePolling: false,
    },
  },
  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2020',
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
  optimizeDeps: {
    include: [],
    exclude: [],
  },
  css: {
    devSourcemap: true,
  },
});