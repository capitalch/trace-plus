import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    minify: 'terser', // Use Terser instead of default esbuild
    terserOptions: {
      compress: true,
      mangle: true, // <-- this enables variable/function name mangling
      format: {
        comments: false, // remove comments
      }
    },
    sourcemap: false // disable source map generation
  }
  // base: './', // Set base path for assets
})
