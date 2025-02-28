import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/slack-api': {
        target: 'https://slack.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/slack-api/, ''),
        headers: {
          'Accept': 'application/json',
        },
      },
    },
  },
})
