import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', 'axios'],
          'icons': ['react-icons'],
          'ui': ['react-toastify', 'emoji-picker-react'],
        }
      }
    },
    chunkSizeWarningLimit: 1200,
  },
  server: {
    port: 5174,
    strictPort: true,
    https: {},
    host: true,
    proxy: {
      '/api': {
        target: 'https://sanay3i.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        secure: false,
      },
      '/storage': {
        target: 'https://sanay3i.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/storage/, '/storage'),
        secure: false,
      }
    }
  }
})
