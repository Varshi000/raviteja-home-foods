import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://187.127.174.100:5454',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ask-question': {
        target: 'http://18.61.65.71:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
