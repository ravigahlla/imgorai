import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import wasm from 'vite-plugin-wasm';
import manifest from './public/manifest.json';

export default defineConfig({
  plugins: [
    wasm(),
    crx({ manifest }),
  ],
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'popup.html',
      },
    },
  },
  optimizeDeps: {
    exclude: ['c2pa'],
  },
});
