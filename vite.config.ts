import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // NOTE: deliberately no `server.proxy` here. In dev mode server.ts runs
      // createViteServer({ middlewareMode: true }) attached to Express on the
      // SAME port as Express's own /api handlers. A `server.proxy` would
      // loop those /api requests back into Express's own port and 500 with
      // EADDRNOTAVAIL. The /api proxy for the standalone preview flow is
      // scoped to `preview.proxy` below instead.
    },
    // `vite preview` (npm run preview) serves dist/ from a separate Vite
    // server on a different port (default :5173). Without this proxy the
    // previewed app can't reach the Express API server on :3000; with it,
    // `fetchApi('/api/...')` resolves across ports transparently.
    preview: {
      proxy: {
        '/api': {
          target: process.env.VITE_PROXY_API_TARGET || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
