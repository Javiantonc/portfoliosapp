import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// Vista previa estática (sin servidor) de la app: npm run preview:build
export default defineConfig({
  root: 'preview',
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  define: {
    'process.env.NEXT_PUBLIC_SUPABASE_URL': 'undefined',
    'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': 'undefined',
  },
  build: { outDir: '../dist-preview', emptyOutDir: true, chunkSizeWarningLimit: 2000 },
})
