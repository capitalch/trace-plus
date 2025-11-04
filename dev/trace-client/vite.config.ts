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
    sourcemap: false, // disable source map generation
    rollupOptions: {
      output: {
        // Manual chunking strategy for better code splitting
        manualChunks: (id) => {
          // Syncfusion - Split into separate chunks by package type
          // Base and common components (loaded by most pages)
          if (id.includes('node_modules/@syncfusion/ej2-base') ||
              id.includes('node_modules/@syncfusion/ej2-react-popups') ||
              id.includes('node_modules/@syncfusion/ej2-popups')) {
            return 'vendor-syncfusion-base';
          }

          // Grid components (heavy but only used in some pages)
          if (id.includes('node_modules/@syncfusion/ej2-react-grids') ||
              id.includes('node_modules/@syncfusion/ej2-grids')) {
            return 'vendor-syncfusion-grids';
          }

          // TreeGrid components (used in specific features)
          if (id.includes('node_modules/@syncfusion/ej2-react-treegrid') ||
              id.includes('node_modules/@syncfusion/ej2-treegrid')) {
            return 'vendor-syncfusion-treegrids';
          }

          // Dropdown components
          if (id.includes('node_modules/@syncfusion/ej2-react-dropdowns') ||
              id.includes('node_modules/@syncfusion/ej2-dropdowns')) {
            return 'vendor-syncfusion-dropdowns';
          }

          // Other Syncfusion packages (inputs, buttons, etc.)
          if (id.includes('node_modules/@syncfusion')) {
            return 'vendor-syncfusion-other';
          }

          // React core libraries
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }

          // Apollo Client and GraphQL
          if (id.includes('node_modules/@apollo') ||
              id.includes('node_modules/graphql') ||
              id.includes('node_modules/apollo-link')) {
            return 'vendor-apollo';
          }

          // Redux and state management
          if (id.includes('node_modules/@reduxjs') ||
              id.includes('node_modules/react-redux') ||
              id.includes('node_modules/redux')) {
            return 'vendor-redux';
          }

          // PDF generation libraries
          if (id.includes('node_modules/jspdf') ||
              id.includes('node_modules/@react-pdf')) {
            return 'vendor-pdf';
          }

          // Form libraries
          if (id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/react-select') ||
              id.includes('node_modules/react-number-format')) {
            return 'vendor-forms';
          }

          // Animation libraries
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-animation';
          }

          // Utility libraries (lodash, decimal, date libraries)
          if (id.includes('node_modules/lodash') ||
              id.includes('node_modules/decimal.js') ||
              id.includes('node_modules/dayjs') ||
              id.includes('node_modules/date-fns')) {
            return 'vendor-utils';
          }

          // UI component libraries
          if (id.includes('node_modules/sweetalert2') ||
              id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/react-draggable') ||
              id.includes('node_modules/react-sliding-pane')) {
            return 'vendor-ui';
          }

          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor-other';
          }
        },
        // Optimize chunk file names
        chunkFileNames: () => {
          return `assets/js/[name]-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  }
  // base: './', // Set base path for assets
})
