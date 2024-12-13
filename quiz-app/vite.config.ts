import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // Ensure the root points to the base directory of your project
  build: {
    outDir: 'dist', // Output folder
  },
});