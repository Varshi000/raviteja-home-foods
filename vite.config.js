import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ask-question': {
        target: 'http://18.61.65.71:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
