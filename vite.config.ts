import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true, // Hot Module Replacement
    watch: {
      usePolling: true, // Useful for some file systems
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'date-fns'],
  },
})
