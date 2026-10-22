import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Static site: `npm run build` writes plain HTML/CSS/JS to ./dist, which Vercel serves directly.
export default defineConfig({
  plugins: [react()],
});
