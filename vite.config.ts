import {resolve} from 'path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.jsx'),
      name: 'My Component',
      fileName: (format) => `my-component.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React'
        }
      }
    }
  },
  plugins: [vanillaExtractPlugin(), react(), svgr()],
})
