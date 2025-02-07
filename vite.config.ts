import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import hotReloadExtension from 'hot-reload-extension-vite'
import manifest from './src/manifest'
import { config } from 'dotenv'
// https://vitejs.dev/config/

config()
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },
    plugins: [
      crx({ manifest }),
      react(),
      nodePolyfills(),
      hotReloadExtension({
        log: true,
        backgroundPath: 'src/background/index.ts',
      }),
    ],
    define: {
      'process.env': process.env,
    },
  }
})
