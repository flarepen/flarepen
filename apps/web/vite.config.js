import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import react from '@vitejs/plugin-react'
import svgrPlugin from 'vite-plugin-svgr'
import wasmPack from 'vite-plugin-wasm-pack'
import {resolve} from 'path';


// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: 'build',
  },
  resolve: {
    alias: {
        '@': resolve(__dirname, 'src'),
    }
  },
  plugins: [
    wasmPack('../../packages/text-render'),
    react(),
    reactRefresh(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
  ],
})