import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// TD 10 : le proxy. Ce qui commence par /api part au serveur (port 3000) : le navigateur ne connaît que Vite.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:3000' },
  },
})
