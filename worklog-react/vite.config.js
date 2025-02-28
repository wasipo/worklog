import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  // 環境変数の設定
  define: {
    'process.env.VITE_SLACK_TOKEN': JSON.stringify(process.env.VITE_SLACK_TOKEN),
    'process.env.VITE_SLACK_CHANNEL': JSON.stringify(process.env.VITE_SLACK_CHANNEL),
  },
});
