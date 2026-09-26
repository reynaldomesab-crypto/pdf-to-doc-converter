import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pdf-ocr-converter/types': path.resolve(__dirname, '../../packages/types/src'),
      '@pdf-ocr-converter/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@pdf-ocr-converter/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@pdf-ocr-converter/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'zustand'],
          ui: ['lucide-react', 'sonner', 'clsx', 'tailwind-merge'],
          tauri: ['@tauri-apps/api', '@tauri-apps/plugin-dialog', '@tauri-apps/plugin-fs', '@tauri-apps/plugin-opener', '@tauri-apps/plugin-os', '@tauri-apps/plugin-shell', '@tauri-apps/plugin-updater'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});