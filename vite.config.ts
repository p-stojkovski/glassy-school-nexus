import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunks
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          router: ['react-router-dom', 'history'],

          // Heavy library chunks
          charts: ['recharts'],
          animation: ['framer-motion'],

          // Forms ecosystem
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Date handling
          dates: ['date-fns', 'react-day-picker'],

          // UI primitives (Radix)
          'ui-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
          ],
        },
      },
    },
  },
  esbuild: {
    target: 'esnext',
  },
}));
