import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import compression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    hmr: { overlay: false },
    headers: {
      'Cross-Origin-Opener-Policy':   'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  },

  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
  ].filter(Boolean),

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  assetsInclude: ['**/*.wasm'],

  worker: { format: 'es' },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('react-router-dom') || id.includes('scheduler')) return 'vendor-react';
          if (id.includes('@tanstack/react-query')) return 'vendor-query';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('@radix-ui/')) return 'vendor-radix';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) return 'vendor-utils';
          if (id.includes('src/pages/Dashboard')) return 'page-dashboard';
          if (id.includes('src/pages/Markets'))   return 'page-markets';
          if (id.includes('src/pages/Charts'))    return 'page-charts';
          if (id.includes('src/components/shared/')) return 'shared-components';
          if (id.includes('src/components/layout/')) return 'layout-components';
          if (id.includes('src/hooks/') || id.includes('src/utils/') || id.includes('src/lib/')) return 'app-core';
        },
      },
    },
  },

  optimizeDeps: {
    exclude: ['@/workers/marketWorker'],
  },
}));
