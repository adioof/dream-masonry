import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-llms-txt',
      closeBundle() {
        copyFileSync('../llms.txt', 'dist/llms.txt');
      },
    },
  ],
  base: '/dream-masonry/',
});
