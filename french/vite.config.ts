import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the code to use process.env.API_KEY as required by the SDK,
    // while Vite replaces it with the actual Vite environment variable at build time.
    'process.env.API_KEY': 'import.meta.env.VITE_API_KEY'
  },
  build: {
    outDir: 'dist',
  },
});
